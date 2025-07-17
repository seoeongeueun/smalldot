import React from "react";
import { useState } from "react";
import * as THREE from "three";
import * as turf from "@turf/turf";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import GlobeLines from "./GlobeLines";
import { ThreeEvent } from "@react-three/fiber";
import type {
  Feature,
  Polygon,
  MultiPolygon,
  GeoJsonProperties,
} from "geojson";
import { useGeoStore } from "@/stores/geoStore";
import { useClickStore } from "@/stores/clickStore";
import PinMarker from "./PinMarker";
import { queryClient } from "@/lib/queryClient";
import { useNotes } from "@/hooks/useNotes";
import { fetchNotesByCountryCodeFn } from "@/api/noteFetchers";

export default function GlobeMesh() {
  const geojson = useGeoStore((s) => s.geojson);
  const setClick = useClickStore((s) => s.setClick);

  const { scene } = useThree(); //그리드 선 보이게 할 때만 사용
  const [textMeshes, setTextMeshes] = useState<React.JSX.Element[]>([]);

  const { fetchNotesByCountryCode } = useNotes();

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();

    if (!geojson) return;
    const { x, y, z } = event.point;

    //3d 공간 좌표를 위도, 경도로 변환
    const { lat, lon } = cartesianToLatLon(x, y, z);
    const clickedPoint = turf.point([lon, lat]);
    let foundFeature: Feature<
      Polygon | MultiPolygon,
      GeoJsonProperties
    > | null = null;

    for (const feature of geojson.features) {
      const geometry = feature.geometry;
      const type = geometry.type;

      //선택한 나라가 여러개의 영역으로 이루어졌는지 (멀티 폴리곤) 확인 후 선택된 폴리곤에만 글자를 배치
      if (type === "Polygon") {
        const coords = geometry.coordinates as number[][][];
        const polygon = turf.polygon(coords);
        if (turf.booleanPointInPolygon(clickedPoint, polygon)) {
          //createPolygonTextMeshes(polygon, feature.properties?.name);
          foundFeature = feature as Feature<Polygon, GeoJsonProperties>;
          break;
        }
      } else if (type === "MultiPolygon") {
        const coords = geometry.coordinates as number[][][][];
        for (const polyCoords of coords) {
          const polygon = turf.polygon(polyCoords);
          if (turf.booleanPointInPolygon(clickedPoint, polygon)) {
            //createPolygonTextMeshes(polygon, feature.properties?.name);
            foundFeature = feature as Feature<MultiPolygon, GeoJsonProperties>;
            break;
          }
        }
      }
      if (foundFeature) break;
    }

    //나라가 존재하는 경우 나라 코드로 소속된 메모를 미리 캐싱
    const countryCode = foundFeature?.properties?.iso_a3;
    if (countryCode) {
      queryClient.prefetchQuery({
        queryKey: ["notes", countryCode],
        queryFn: () => fetchNotesByCountryCodeFn(countryCode as string),
      });
    }

    //소수점 3자리로 반올림 후 저장
    setClick(
      Math.round(lat * 1e3) / 1e3,
      Math.round(lon * 1e3) / 1e3,
      foundFeature
    );
  }

  function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
    const texts = [
      "  sample text 1 sample text 1 sample text 1 sample text 1",
      "  sample text 2 sample text 2 sample text 2",
      " sample text 3",
      " sample text 4 sample text 4",
    ];
    const colorPalette = [
      "green",
      "darkkhaki",
      "orange",
      "orangered",
      "firebrick",
    ];
    const newMeshes: React.JSX.Element[] = [];

    texts.forEach((text, textIndex) => {
      const chars = text.split("");
      const charCount = chars.length;

      // 나라 좌표를 기반으로 사각형 영역 (bboxArea) 을 계산
      let minLng = Infinity,
        minLat = Infinity;
      let maxLng = -Infinity,
        maxLat = -Infinity;

      // 항상 단일 폴리곤만을 전달 받음
      const coords = polygon.geometry.coordinates[0] as [number, number][]; //2d 좌표로만 쓰고 있기 때문에 타입 강제

      coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });

      const lngSpan = maxLng - minLng;
      const latSpan = maxLat - minLat;
      const bboxArea = lngSpan * latSpan;

      // 전체 나라의 사각형 면적을 글자 수로 나눠서 임시로 큰 cell 사이즈로 시작
      let cellSize = Math.sqrt(bboxArea / charCount);
      let internalCells = [];
      let maxAttempts = 15;
      let attempt = 0;

      // 임시 cell 사이즈는 크기 때문에 나라 면적 내부에 글자 수 만큼 cell이 들어가려면 크기를 줄여야함
      // 반복해서 cell size를 줄이며 글자만큼은 보장하되 그 중 가장 cell이 큰 사이즈를 찾기
      while (attempt < maxAttempts) {
        internalCells = [];

        // 전체 영역을 cell 크기로 나누어 그리드 계산
        const gridCols = Math.ceil(lngSpan / cellSize);
        const gridRows = Math.ceil(latSpan / cellSize);

        const lngStep = lngSpan / gridCols;
        const latStep = latSpan / gridRows;

        // 셀의 중심점이 나라 폴리곤 내부에 있는 경우 별도로 분리해두기
        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            const lngCenter = minLng + col * lngStep + lngStep / 2;
            const latCenter = maxLat - row * latStep - latStep / 2;
            if (
              turf.booleanPointInPolygon(
                turf.point([lngCenter, latCenter]),
                polygon
              )
            ) {
              internalCells.push({
                lng: lngCenter,
                lat: latCenter,
                lngStep,
                latStep,
              });
            }
          }
        }

        // 글자 수 이상 내부 cell이 확보됐으면 종료
        if (internalCells.length >= charCount) break;

        // 부족한 경우 cell 사이즈를 차차 줄여가면서 더 많은 cell을 확보 시도
        cellSize *= 0.95;
        attempt++;
      }

      if (internalCells.length < charCount) {
        console.warn(
          `텍스트 라인 ${
            textIndex + 1
          } : 글자 수만큼 내부 cell을 확보하지 못했습니다.`
        );
        return;
      }

      const pickedCells = internalCells.slice(0, charCount); //앞에서부터 글자 수 만큼 셀 선택

      pickedCells.forEach((cell, index) => {
        // 셀의 위도/경도를 라디안 단위로 변환 (구면 좌표 계산용)
        const phi = ((90 - cell.lat) * Math.PI) / 180; //북극이 0도라서 90 - 위도
        const theta = (-(cell.lng + 180) * Math.PI) / 180; // 국경 그릴 때와 동일하게 좌우반전
        const r = 1.01 + textIndex * 0.007; // + 층마다 위로 올리기

        // 구면 좌표를 3d 좌표로 변환
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        // 텍스트가 지구 중심을 바라보도록 회전값을 계산
        const posVec = new THREE.Vector3(x, y, z);
        const lookAtMatrix = new THREE.Matrix4();
        lookAtMatrix.lookAt(
          posVec,
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 1, 0)
        );
        const rotation = new THREE.Euler().setFromRotationMatrix(lookAtMatrix);

        // 그리드 사이즈 기반으로 적절한 폰트 사이즈를 계산
        const phi2 = phi;
        const theta2 = (-(cell.lng + cell.lngStep + 180) * Math.PI) / 180;
        const pos2 = new THREE.Vector3(
          Math.sin(phi2) * Math.cos(theta2),
          Math.cos(phi2),
          Math.sin(phi2) * Math.sin(theta2)
        );
        const cellWorldWidth = posVec.distanceTo(pos2);

        const dynamicRatio = THREE.MathUtils.clamp(
          0.25 + (cellWorldWidth - 0.01) * 100, // 선형 증폭 (작은 셀의 기준 = 0.01)
          0.35, // 작은 셀은 폰트를 더 작게 보정
          0.7 // 큰 셀의 경우는 큰 폰트
        );

        const fontSize = cellWorldWidth * dynamicRatio;
        const color = colorPalette[textIndex % colorPalette.length];

        newMeshes.push(
          <Text
            font="https://fastly.jsdelivr.net/gh/supernovice-lab/font@0.9/yangjin.woff"
            key={`char-${textIndex}-${index}`}
            position={[x, y, z]}
            fontSize={fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            // outlineWidth="7%"
            // outlineColor={colorPalette[(textIndex + 1) % colorPalette.length]}
            rotation={[rotation.x, rotation.y, rotation.z]}
            scale={[0.8, 1, 1]}
          >
            {chars[index].toUpperCase()}
          </Text>
        );
        // grid 선
        // const corners = [
        //   [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2],
        //   [cell.lng + cell.lngStep / 2, cell.lat + cell.latStep / 2],
        //   [cell.lng + cell.lngStep / 2, cell.lat - cell.latStep / 2],
        //   [cell.lng - cell.lngStep / 2, cell.lat - cell.latStep / 2],
        //   [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2],
        // ];
        // const points = corners.map(([lngC, latC]) => {
        //   const phiC = ((90 - latC) * Math.PI) / 180;
        //   const thetaC = (-(lngC + 180) * Math.PI) / 180;
        //   return new THREE.Vector3(
        //     1.011 * Math.sin(phiC) * Math.cos(thetaC),
        //     1.011 * Math.cos(phiC),
        //     1.011 * Math.sin(phiC) * Math.sin(thetaC)
        //   );
        // });
        // const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const material = new THREE.LineBasicMaterial({ color: "yellow" });
        // const line = new THREE.Line(geometry, material);
        // scene.add(line);
      });
    });

    setTextMeshes(newMeshes);
  }

  return (
    <>
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="steelblue" transparent opacity={0.5} />
      </mesh>
      <GlobeLines />
      {textMeshes}
      <PinMarker />
    </>
  );
}

// TODO: 유틸 함수 분리 필요
function cartesianToLatLon(
  x: number,
  y: number,
  z: number
): { lat: number; lon: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - (Math.acos(y / r) * 180) / Math.PI;
  let lon = (Math.atan2(z, x) * 180) / Math.PI;
  lon = -lon - 180;
  lon = ((lon + 540) % 360) - 180;
  return { lat, lon };
}
