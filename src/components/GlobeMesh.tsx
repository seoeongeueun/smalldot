import React from "react";
import { useState, useEffect } from "react";
import * as THREE from "three";
import * as turf from "@turf/turf";
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
import { fetchNotesByCountryCodeFn } from "@/api/noteFetchers";
import { cartesianToLatLon } from "@/utils/helpers";
import { useNotes } from "@/hooks/useNotes";
import TextLabel from "./TextLabel";
import type { TextPlacement, GridCell } from "@/types/globe";
import { Suspense } from "react";
import { TEXT_LABEL_OPTIONS } from "@/utils/constants";
import GridCells from "./GridCells";

export default function GlobeMesh() {
  const geojson = useGeoStore((s) => s.geojson);
  const setClick = useClickStore((s) => s.setClick);
  const countryCode = useClickStore((s) => s.countryCode);

  const { fetchNotesByCountryCode } = useNotes();
  const { data: notes, isLoading } = fetchNotesByCountryCode(countryCode);

  const [textPlacements, setTextPlacements] = useState<TextPlacement[]>([]);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [selectedPolygon, setSelectedPolygon] =
    useState<Feature<Polygon> | null>(null);

  // notes가 준비되면 자동으로 텍스트 메쉬 생성
  useEffect(() => {
    if (selectedPolygon) createPolygonTextMeshes();
  }, [selectedPolygon, notes]);

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
          setSelectedPolygon(polygon);
          foundFeature = feature as Feature<Polygon, GeoJsonProperties>;
          break;
        }
      } else if (type === "MultiPolygon") {
        const coords = geometry.coordinates as number[][][][];
        for (const polyCoords of coords) {
          const polygon = turf.polygon(polyCoords);
          if (turf.booleanPointInPolygon(clickedPoint, polygon)) {
            setSelectedPolygon(polygon);
            foundFeature = feature as Feature<MultiPolygon, GeoJsonProperties>;
            break;
          }
        }
      } else {
        setSelectedPolygon(null);
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

  // 나라 면적을 그리드로 만들고 제목 텍스트를 내부에 배치하는 로직
  // 현재 줄바꿈은 고려하지 않고 한 줄에 제목 전체가 전부 들어가는 경우에만 배치한다
  function createPolygonTextMeshes() {
    if (!selectedPolygon) return;

    //노트가 있다가 삭제된 경우도 있기 때문에 명시적으로 비워줌
    if (!notes?.length) {
      setTextPlacements([]);
      return;
    }

    const coords = selectedPolygon.geometry.coordinates[0] as [
      number,
      number
    ][];
    const minLng = Math.min(...coords.map(([lng]) => lng));
    const maxLng = Math.max(...coords.map(([lng]) => lng));
    const minLat = Math.min(...coords.map(([, lat]) => lat));
    const maxLat = Math.max(...coords.map(([, lat]) => lat));

    const gridCols = Math.ceil(
      (maxLng - minLng) / TEXT_LABEL_OPTIONS.CELL_SIZE
    );
    const gridRows = Math.ceil(
      (maxLat - minLat) / TEXT_LABEL_OPTIONS.CELL_SIZE
    );
    const lngStep = (maxLng - minLng) / gridCols;
    const latStep = (maxLat - minLat) / gridRows;

    const grid: (string | null)[][] = Array.from({ length: gridRows }, () =>
      Array(gridCols).fill(null)
    );

    //그리드 셀을 나라 위에 노출할 때만 사용
    // const newGridCells: GridCell[] = [];
    // for (let row = 0; row < gridRows; row++) {
    //   for (let col = 0; col < gridCols; col++) {
    //     if (!isInside(row, col)) continue;

    //     const lngCenter = minLng + col * lngStep + lngStep / 2;
    //     const latCenter = maxLat - row * latStep - latStep / 2;

    //     const halfLng = lngStep / 2;
    //     const halfLat = latStep / 2;

    //     const corners: [number, number][] = [
    //       [lngCenter - halfLng, latCenter + halfLat],
    //       [lngCenter + halfLng, latCenter + halfLat],
    //       [lngCenter + halfLng, latCenter - halfLat],
    //       [lngCenter - halfLng, latCenter - halfLat],
    //       [lngCenter - halfLng, latCenter + halfLat],
    //     ];

    //     const toXYZ = ([lng, lat]: [number, number]) => {
    //       const phi = ((90 - lat) * Math.PI) / 180;
    //       const theta = (-(lng + 180) * Math.PI) / 180;
    //       return new THREE.Vector3(
    //         1.011 * Math.sin(phi) * Math.cos(theta),
    //         1.011 * Math.cos(phi),
    //         1.011 * Math.sin(phi) * Math.sin(theta)
    //       );
    //     };

    //     //const points = corners.map(toXYZ);
    //     const points = corners.map(toXYZ) as [
    //       THREE.Vector3,
    //       THREE.Vector3,
    //       THREE.Vector3,
    //       THREE.Vector3,
    //       THREE.Vector3
    //     ];

    //     newGridCells.push({ points });
    //   }
    // }
    // setGridCells(newGridCells);

    const titles = notes
      .map((note) => note.title.trim()) // 앞뒤 공백 포함 \n 제거
      .filter((title) => !!title) // 빈 문자열 제거
      .sort((a, b) => b.length - a.length); // 긴 것부터 내림차순
    const placements: TextPlacement[] = [];

    //나라 면적 내부에 들어가는지 계산
    function isInside(row: number, col: number) {
      const lngCenter = minLng + col * lngStep + lngStep / 2;
      const latCenter = maxLat - row * latStep - latStep / 2;
      return turf.booleanPointInPolygon(
        turf.point([lngCenter, latCenter]),
        selectedPolygon!
      );
    }

    function findAvailableSpans(row: number): [number, number][] {
      const spans: [number, number][] = [];
      let start = -1;

      for (let col = 0; col < gridCols; col++) {
        if (isInside(row, col) && grid[row][col] === null) {
          if (start === -1) start = col;
        } else {
          if (start !== -1 && col - start >= 1) {
            spans.push([start, col - 1]);
          }
          start = -1;
        }
      }
      if (start !== -1 && gridCols - start >= 1) {
        spans.push([start, gridCols - 1]);
      }
      return spans;
    }

    for (const title of titles) {
      const len = title.length;
      let placed = false;

      for (let row = 0; row < gridRows; row++) {
        const spans = findAvailableSpans(row);

        for (const [start, end] of spans) {
          const usableLength = end - start + 1;

          //한 줄에 텍스트가 다 들어갈 칸이 부족하면 스킵
          if (usableLength < len) continue;

          for (let offset = 0; offset <= usableLength - len; offset++) {
            const insertCol = start + offset;

            // 텍스트가 들어갈 자리가 유효한지 확인
            let canPlace = true;
            for (let j = 0; j < len; j++) {
              const col = insertCol + j;
              if (!isInside(row, col) || grid[row][col] !== null) {
                canPlace = false;
                break;
              }
            }

            // 한 칸 내로 다른 텍스트가 이미 배치된 경우 스킵
            const leftCol = insertCol - 1;
            const rightCol = insertCol + len;

            const leftConflict =
              leftCol >= 0 && typeof grid[row][leftCol] === "string";
            const rightConflict =
              rightCol < gridCols && typeof grid[row][rightCol] === "string";

            if (leftConflict || rightConflict) continue;

            // 텍스트를 배치하기 위해 필요한 정보를 저장
            for (let j = 0; j < len; j++) {
              const col = insertCol + j;
              grid[row][col] = title[j];

              const lng = minLng + col * lngStep + lngStep / 2;
              const lat = maxLat - row * latStep - latStep / 2;

              const phi = ((90 - lat) * Math.PI) / 180;
              const theta = (-(lng + 180) * Math.PI) / 180;
              const theta2 = (-(lng + lngStep + 180) * Math.PI) / 180;

              const v1 = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta)
              );
              const v2 = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta2),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(theta2)
              );
              const cellWidth = v1.distanceTo(v2);
              const fontSize = cellWidth * TEXT_LABEL_OPTIONS.FONT_MULTIPLIER;

              const radius = 1.011;
              const x = radius * Math.sin(phi) * Math.cos(theta);
              const y = radius * Math.cos(phi);
              const z = radius * Math.sin(phi) * Math.sin(theta);
              const posVec: [number, number, number] = [x, y, z];

              const lookAtMatrix = new THREE.Matrix4();
              lookAtMatrix.lookAt(
                new THREE.Vector3(...posVec),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1, 0)
              );
              const rotation = new THREE.Euler().setFromRotationMatrix(
                lookAtMatrix
              );

              placements.push({
                letter: title[j],
                position: posVec,
                rotation,
                fontSize,
              });
            }

            placed = true;
            break;
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }

    setTextPlacements(placements);
  }

  return (
    <>
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="steelblue"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
      <GlobeLines />
      {/* suspense로 비동기 로딩이 완료되면 렌더링 하는 것으로 깜빡임 방지 */}
      {
        <Suspense fallback={null}>
          {textPlacements.map((p) => (
            <TextLabel
              key={`${p.letter}-${p.position[0]}-${p.position[1]}-${p.position[2]}`}
              {...p}
            />
          ))}
          {/* <GridCells lines={gridCells} /> */}
        </Suspense>
      }
      <PinMarker />
    </>
  );
}
