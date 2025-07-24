import React from "react";
import { useState } from "react";
import * as THREE from "three";
import * as turf from "@turf/turf";
import { useThree } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
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

export default function GlobeMesh() {
  const geojson = useGeoStore((s) => s.geojson);
  const setClick = useClickStore((s) => s.setClick);
  const countryCode = useClickStore((s) => s.countryCode);

  //TODO: 나중에는 유저별 전체 노트를 가져오는 것으로 수정 필요
  const { fetchNotesByCountryCode } = useNotes();
  const { data: notes, isLoading } = fetchNotesByCountryCode(countryCode);

  const { scene } = useThree(); //그리드 선 보이게 할 때만 사용
  const [textMeshes, setTextMeshes] = useState<React.JSX.Element[]>([]);

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
          createPolygonTextMeshes(polygon);
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

  // function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
  //   // const texts = [
  //   //   "  sample text 1 sample text 1 sample text 1 sample text 1",
  //   //   "  sample text 2 sample text 2 sample text 2",
  //   //   " sample text 3",
  //   //   " sample text 4 sample text 4",
  //   // ];
  //   const colorPalette = [
  //     "green",
  //     "darkkhaki",
  //     "orange",
  //     "orangered",
  //     "firebrick",
  //   ];
  //   const newMeshes: React.JSX.Element[] = [];
  //   if (!notes?.length) return;

  //   const titles = notes.map((note) => note.title);

  //   titles.forEach((title, titleIndex) => {
  //     const chars = title.split("");
  //     const charCount = chars.length;

  //     // 나라 좌표를 기반으로 사각형 영역 (bboxArea) 을 계산
  //     let minLng = Infinity,
  //       minLat = Infinity;
  //     let maxLng = -Infinity,
  //       maxLat = -Infinity;

  //     // 항상 단일 폴리곤만을 전달 받음
  //     const coords = polygon.geometry.coordinates[0] as [number, number][]; //2d 좌표로만 쓰고 있기 때문에 타입 강제

  //     coords.forEach(([lng, lat]) => {
  //       minLng = Math.min(minLng, lng);
  //       maxLng = Math.max(maxLng, lng);
  //       minLat = Math.min(minLat, lat);
  //       maxLat = Math.max(maxLat, lat);
  //     });

  //     const lngSpan = maxLng - minLng;
  //     const latSpan = maxLat - minLat;
  //     const bboxArea = lngSpan * latSpan;

  //     // 전체 나라의 사각형 면적을 글자 수로 나눠서 임시로 큰 cell 사이즈로 시작
  //     let cellSize = Math.sqrt(bboxArea / charCount);
  //     let internalCells = [];
  //     let maxAttempts = 15;
  //     let attempt = 0;

  //     // 임시 cell 사이즈는 크기 때문에 나라 면적 내부에 글자 수 만큼 cell이 들어가려면 크기를 줄여야함
  //     // 반복해서 cell size를 줄이며 글자만큼은 보장하되 그 중 가장 cell이 큰 사이즈를 찾기
  //     while (attempt < maxAttempts) {
  //       internalCells = [];

  //       // 전체 영역을 cell 크기로 나누어 그리드 계산
  //       const gridCols = Math.ceil(lngSpan / cellSize);
  //       const gridRows = Math.ceil(latSpan / cellSize);

  //       const lngStep = lngSpan / gridCols;
  //       const latStep = latSpan / gridRows;

  //       // 셀의 중심점이 나라 폴리곤 내부에 있는 경우 별도로 분리해두기
  //       for (let row = 0; row < gridRows; row++) {
  //         for (let col = 0; col < gridCols; col++) {
  //           const lngCenter = minLng + col * lngStep + lngStep / 2;
  //           const latCenter = maxLat - row * latStep - latStep / 2;
  //           if (
  //             turf.booleanPointInPolygon(
  //               turf.point([lngCenter, latCenter]),
  //               polygon
  //             )
  //           ) {
  //             internalCells.push({
  //               lng: lngCenter,
  //               lat: latCenter,
  //               lngStep,
  //               latStep,
  //             });
  //           }
  //         }
  //       }

  //       // 글자 수 이상 내부 cell이 확보됐으면 종료
  //       if (internalCells.length >= charCount) break;

  //       // 부족한 경우 cell 사이즈를 차차 줄여가면서 더 많은 cell을 확보 시도
  //       cellSize *= 0.95;
  //       attempt++;
  //     }

  //     if (internalCells.length < charCount) {
  //       console.warn(
  //         `텍스트 라인 ${
  //           titleIndex + 1
  //         } : 글자 수만큼 내부 cell을 확보하지 못했습니다.`
  //       );
  //       return;
  //     }

  //     const pickedCells = internalCells.slice(0, charCount); //앞에서부터 글자 수 만큼 셀 선택

  //     pickedCells.forEach((cell, index) => {
  //       // 셀의 위도/경도를 라디안 단위로 변환 (구면 좌표 계산용)
  //       const phi = ((90 - cell.lat) * Math.PI) / 180; //북극이 0도라서 90 - 위도
  //       const theta = (-(cell.lng + 180) * Math.PI) / 180; // 국경 그릴 때와 동일하게 좌우반전
  //       const r = 1.01 + titleIndex * 0.007; // + 층마다 위로 올리기

  //       // 구면 좌표를 3d 좌표로 변환
  //       const x = r * Math.sin(phi) * Math.cos(theta);
  //       const y = r * Math.cos(phi);
  //       const z = r * Math.sin(phi) * Math.sin(theta);

  //       // 텍스트가 지구 중심을 바라보도록 회전값을 계산
  //       const posVec = new THREE.Vector3(x, y, z);
  //       const lookAtMatrix = new THREE.Matrix4();
  //       lookAtMatrix.lookAt(
  //         posVec,
  //         new THREE.Vector3(0, 0, 0),
  //         new THREE.Vector3(0, 1, 0)
  //       );
  //       const rotation = new THREE.Euler().setFromRotationMatrix(lookAtMatrix);

  //       // 그리드 사이즈 기반으로 적절한 폰트 사이즈를 계산
  //       const phi2 = phi;
  //       const theta2 = (-(cell.lng + cell.lngStep + 180) * Math.PI) / 180;
  //       const pos2 = new THREE.Vector3(
  //         Math.sin(phi2) * Math.cos(theta2),
  //         Math.cos(phi2),
  //         Math.sin(phi2) * Math.sin(theta2)
  //       );
  //       const cellWorldWidth = posVec.distanceTo(pos2);

  //       const dynamicRatio = THREE.MathUtils.clamp(
  //         0.25 + (cellWorldWidth - 0.01) * 100, // 선형 증폭 (작은 셀의 기준 = 0.01)
  //         0.35, // 작은 셀은 폰트를 더 작게 보정
  //         0.7 // 큰 셀의 경우는 큰 폰트
  //       );

  //       const fontSize = cellWorldWidth * dynamicRatio;
  //       const color = colorPalette[titleIndex % colorPalette.length];

  //       newMeshes.push(
  //         <Text
  //           key={`char-${titleIndex}-${index}`}
  //           position={[x, y, z]}
  //           fontSize={fontSize}
  //           color={color}
  //           anchorX="center"
  //           anchorY="middle"
  //           // outlineWidth="7%"
  //           // outlineColor={colorPalette[(textIndex + 1) % colorPalette.length]}
  //           rotation={[rotation.x, rotation.y, rotation.z]}
  //           scale={[0.8, 1, 1]}
  //         >
  //           {chars[index].toUpperCase()}
  //         </Text>
  //       );
  //       // grid 선
  //       // const corners = [
  //       //   [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2],
  //       //   [cell.lng + cell.lngStep / 2, cell.lat + cell.latStep / 2],
  //       //   [cell.lng + cell.lngStep / 2, cell.lat - cell.latStep / 2],
  //       //   [cell.lng - cell.lngStep / 2, cell.lat - cell.latStep / 2],
  //       //   [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2],
  //       // ];
  //       // const points = corners.map(([lngC, latC]) => {
  //       //   const phiC = ((90 - latC) * Math.PI) / 180;
  //       //   const thetaC = (-(lngC + 180) * Math.PI) / 180;
  //       //   return new THREE.Vector3(
  //       //     1.011 * Math.sin(phiC) * Math.cos(thetaC),
  //       //     1.011 * Math.cos(phiC),
  //       //     1.011 * Math.sin(phiC) * Math.sin(thetaC)
  //       //   );
  //       // });
  //       // const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //       // const material = new THREE.LineBasicMaterial({ color: "yellow" });
  //       // const line = new THREE.Line(geometry, material);
  //       // scene.add(line);
  //     });
  //   });

  //   setTextMeshes(newMeshes);
  // }

  // function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
  //   // const texts = [
  //   //   "  sample text 1 sample text 1 sample text 1 sample text 1",
  //   //   "  sample text 2 sample text 2 sample text 2",
  //   //   " sample text 3",
  //   //   " sample text 4 sample text 4",
  //   //];
  //   const newMeshes: React.JSX.Element[] = [];
  //   if (!notes?.length) return;

  //   const titles = notes.map((note) => note.title);

  //   titles.forEach((title, titleIndex) => {
  //     const chars = title.split("");
  //     const charCount = chars.length;

  //     // 나라 좌표를 기반으로 사각형 영역 (bboxArea) 을 계산
  //     let minLng = Infinity,
  //       minLat = Infinity;
  //     let maxLng = -Infinity,
  //       maxLat = -Infinity;

  //     // 항상 단일 폴리곤만을 전달 받음
  //     const coords = polygon.geometry.coordinates[0] as [number, number][]; //2d 좌표로만 쓰고 있기 때문에 타입 강제

  //     coords.forEach(([lng, lat]) => {
  //       minLng = Math.min(minLng, lng);
  //       maxLng = Math.max(maxLng, lng);
  //       minLat = Math.min(minLat, lat);
  //       maxLat = Math.max(maxLat, lat);
  //     });

  //     const lngSpan = maxLng - minLng;
  //     const latSpan = maxLat - minLat;
  //     const bboxArea = lngSpan * latSpan;

  //     // 전체 나라의 사각형 면적을 글자 수로 나눠서 임시로 큰 cell 사이즈로 시작
  //     const cellSize = 0.3;
  //     let internalCells = [];

  //     // 전체 영역을 cell 크기로 나누어 그리드 계산
  //     const gridCols = Math.ceil(lngSpan / cellSize);
  //     const gridRows = Math.ceil(latSpan / cellSize);

  //     const lngStep = lngSpan / gridCols;
  //     const latStep = latSpan / gridRows;

  //     // 셀의 중심점이 나라 폴리곤 내부에 있는 경우 별도로 분리해두기
  //     for (let row = 0; row < gridRows; row++) {
  //       for (let col = 0; col < gridCols; col++) {
  //         const lngCenter = minLng + col * lngStep + lngStep / 2;
  //         const latCenter = maxLat - row * latStep - latStep / 2;
  //         if (
  //           turf.booleanPointInPolygon(
  //             turf.point([lngCenter, latCenter]),
  //             polygon
  //           )
  //         ) {
  //           internalCells.push({
  //             lng: lngCenter,
  //             lat: latCenter,
  //             lngStep,
  //             latStep,
  //           });
  //         }
  //       }
  //     }
  //   });
  // }
  // function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
  //   if (!notes?.length) return;

  //   const titles = notes.map((note) => note.title);

  //   // titles.forEach((title, titleIndex) => {
  //   //   const chars = title.split("");
  //   //   const charCount = chars.length;

  //   // 나라 좌표를 기반으로 사각형 영역 (bboxArea) 을 계산
  //   let minLng = Infinity,
  //     minLat = Infinity;
  //   let maxLng = -Infinity,
  //     maxLat = -Infinity;

  //   // 항상 단일 폴리곤만을 전달 받음
  //   const coords = polygon.geometry.coordinates[0] as [number, number][]; //2d 좌표로만 쓰고 있기 때문에 타입 강제

  //   coords.forEach(([lng, lat]) => {
  //     minLng = Math.min(minLng, lng);
  //     maxLng = Math.max(maxLng, lng);
  //     minLat = Math.min(minLat, lat);
  //     maxLat = Math.max(maxLat, lat);
  //   });

  //   const lngSpan = maxLng - minLng;
  //   const latSpan = maxLat - minLat;
  //   const bboxArea = lngSpan * latSpan;

  //   // 고정된 정사각형 그리드 셀 크기
  //   const cellSize = 1;
  //   let internalCells = [];

  //   // 전체 영역을 cell 크기로 나누어 그리드 계산
  //   const gridCols = Math.ceil(lngSpan / cellSize);
  //   const gridRows = Math.ceil(latSpan / cellSize);

  //   const lngStep = lngSpan / gridCols;
  //   const latStep = latSpan / gridRows;

  //   // 셀의 중심점이 나라 폴리곤 내부에 있는 경우 별도로 분리해두기
  //   for (let row = 0; row < gridRows; row++) {
  //     for (let col = 0; col < gridCols; col++) {
  //       const lngCenter = minLng + col * lngStep + lngStep / 2;
  //       const latCenter = maxLat - row * latStep - latStep / 2;
  //       if (
  //         turf.booleanPointInPolygon(
  //           turf.point([lngCenter, latCenter]),
  //           polygon
  //         )
  //       ) {
  //         internalCells.push({
  //           lng: lngCenter,
  //           lat: latCenter,
  //           lngStep,
  //           latStep,
  //         });
  //       }
  //     }
  //   }

  //   // 내부 셀마다 그리드 선 그리기
  //   const gridMeshes: React.JSX.Element[] = [];

  //   const toXYZ = ([lng, lat]: [number, number]) => {
  //     const phi = ((90 - lat) * Math.PI) / 180;
  //     const theta = (-(lng + 180) * Math.PI) / 180;
  //     return new THREE.Vector3(
  //       1.011 * Math.sin(phi) * Math.cos(theta),
  //       1.011 * Math.cos(phi),
  //       1.011 * Math.sin(phi) * Math.sin(theta)
  //     );
  //   };

  //   internalCells.forEach((cell, i) => {
  //     const corners: [number, number][] = [
  //       [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2],
  //       [cell.lng + cell.lngStep / 2, cell.lat + cell.latStep / 2],
  //       [cell.lng + cell.lngStep / 2, cell.lat - cell.latStep / 2],
  //       [cell.lng - cell.lngStep / 2, cell.lat - cell.latStep / 2],
  //       [cell.lng - cell.lngStep / 2, cell.lat + cell.latStep / 2], // 닫기
  //     ];
  //     const points = corners.map(toXYZ);

  //     gridMeshes.push(
  //       <Line
  //         key={`cell-${name}-${i}`}
  //         points={points}
  //         color="#888"
  //         lineWidth={0.5}
  //       />
  //     );
  //   });

  //   setTextMeshes(gridMeshes); // 확인용: setTextMeshes로 추가

  //   // });
  // }

  // function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
  //   if (!notes?.length) return;

  //   const titles = notes.map((note) => note.title);

  //   let minLng = Infinity,
  //     minLat = Infinity;
  //   let maxLng = -Infinity,
  //     maxLat = -Infinity;

  //   const coords = polygon.geometry.coordinates[0] as [number, number][];

  //   coords.forEach(([lng, lat]) => {
  //     minLng = Math.min(minLng, lng);
  //     maxLng = Math.max(maxLng, lng);
  //     minLat = Math.min(minLat, lat);
  //     maxLat = Math.max(maxLat, lat);
  //   });

  //   const lngSpan = maxLng - minLng;
  //   const latSpan = maxLat - minLat;

  //   const cellSize = 1;
  //   const gridCols = Math.ceil(lngSpan / cellSize);
  //   const gridRows = Math.ceil(latSpan / cellSize);
  //   const lngStep = lngSpan / gridCols;
  //   const latStep = latSpan / gridRows;

  //   const grid: { used: boolean; lat: number; lng: number }[][] = [];
  //   const internalCells: {
  //     lng: number;
  //     lat: number;
  //     col: number;
  //     row: number;
  //   }[] = [];

  //   for (let row = 0; row < gridRows; row++) {
  //     grid[row] = [];
  //     for (let col = 0; col < gridCols; col++) {
  //       const lngCenter = minLng + col * lngStep + lngStep / 2;
  //       const latCenter = maxLat - row * latStep - latStep / 2;
  //       if (
  //         turf.booleanPointInPolygon(
  //           turf.point([lngCenter, latCenter]),
  //           polygon
  //         )
  //       ) {
  //         grid[row][col] = { used: false, lat: latCenter, lng: lngCenter };
  //         internalCells.push({ lat: latCenter, lng: lngCenter, row, col });
  //       } else {
  //         grid[row][col] = { used: true, lat: latCenter, lng: lngCenter }; // 외부 셀은 사용 불가로 표시
  //       }
  //     }
  //   }

  //   const gridMeshes: React.JSX.Element[] = [];
  //   const toXYZ = ([lng, lat]: [number, number]) => {
  //     const phi = ((90 - lat) * Math.PI) / 180;
  //     const theta = (-(lng + 180) * Math.PI) / 180;
  //     return new THREE.Vector3(
  //       1.011 * Math.sin(phi) * Math.cos(theta),
  //       1.011 * Math.cos(phi),
  //       1.011 * Math.sin(phi) * Math.sin(theta)
  //     );
  //   };

  //   internalCells.forEach((cell, i) => {
  //     const corners: [number, number][] = [
  //       [cell.lng - lngStep / 2, cell.lat + latStep / 2],
  //       [cell.lng + lngStep / 2, cell.lat + latStep / 2],
  //       [cell.lng + lngStep / 2, cell.lat - latStep / 2],
  //       [cell.lng - lngStep / 2, cell.lat - latStep / 2],
  //       [cell.lng - lngStep / 2, cell.lat + latStep / 2],
  //     ];
  //     const points = corners.map(toXYZ);

  //     gridMeshes.push(
  //       <Line
  //         key={`cell-${name}-${i}`}
  //         points={points}
  //         color="#888"
  //         lineWidth={0.5}
  //       />
  //     );
  //   });

  //   const newMeshes: React.JSX.Element[] = [];
  //   const layerUsage: number[] = [];
  //   const MAX_LAYERS = 10;

  //   for (let titleIndex = 0; titleIndex < titles.length; titleIndex++) {
  //     const title = titles[titleIndex];
  //     const chars = title.split("");
  //     const len = chars.length;
  //     let placed = false;

  //     for (let r = 0; r < MAX_LAYERS && !placed; r++) {
  //       if (!layerUsage[r]) layerUsage[r] = 0;

  //       const tries = 100;
  //       for (let t = 0; t < tries && !placed; t++) {
  //         const row = Math.floor(Math.random() * gridRows);
  //         const col = Math.floor(Math.random() * (gridCols - len));

  //         let fits = true;
  //         for (let i = -1; i <= len; i++) {
  //           for (let j = -1; j <= 1; j++) {
  //             const c = col + i;
  //             const r2 = row + j;
  //             if (c < 0 || c >= gridCols || r2 < 0 || r2 >= gridRows) continue;
  //             if (i >= 0 && i < len) {
  //               if (grid[r2][c]?.used) fits = false;
  //             } else {
  //               if (grid[r2][c]?.used) fits = false;
  //             }
  //           }
  //         }

  //         if (fits) {
  //           for (let i = 0; i < len; i++) {
  //             grid[row][col + i].used = true;

  //             const lng = grid[row][col + i].lng;
  //             const lat = grid[row][col + i].lat;

  //             const phi = ((90 - lat) * Math.PI) / 180;
  //             const theta = (-(lng + 180) * Math.PI) / 180;
  //             const radius = 1.011 + r * 0.007;
  //             const x = radius * Math.sin(phi) * Math.cos(theta);
  //             const y = radius * Math.cos(phi);
  //             const z = radius * Math.sin(phi) * Math.sin(theta);

  //             const posVec = new THREE.Vector3(x, y, z);
  //             const lookAtMatrix = new THREE.Matrix4();
  //             lookAtMatrix.lookAt(
  //               posVec,
  //               new THREE.Vector3(0, 0, 0),
  //               new THREE.Vector3(0, 1, 0)
  //             );
  //             const rotation = new THREE.Euler().setFromRotationMatrix(
  //               lookAtMatrix
  //             );

  //             const theta2 = (-(lng + lngStep + 180) * Math.PI) / 180;
  //             const v1 = new THREE.Vector3(
  //               Math.sin(phi) * Math.cos(theta),
  //               Math.cos(phi),
  //               Math.sin(phi) * Math.sin(theta)
  //             );
  //             const v2 = new THREE.Vector3(
  //               Math.sin(phi) * Math.cos(theta2),
  //               Math.cos(phi),
  //               Math.sin(phi) * Math.sin(theta2)
  //             );
  //             const cellWidthInWorld = v1.distanceTo(v2);

  //             // 폰트 사이즈 보정 계수
  //             const fontSize = cellWidthInWorld * 0.65;

  //             newMeshes.push(
  //               <Text
  //                 key={`char-${titleIndex}-${i}`}
  //                 position={[x, y, z]}
  //                 fontSize={fontSize}
  //                 color="#fff"
  //                 rotation={[rotation.x, rotation.y, rotation.z]}
  //                 anchorX="center"
  //                 anchorY="middle"
  //               >
  //                 {chars[i].toUpperCase()}
  //               </Text>
  //             );
  //           }

  //           layerUsage[r]++;
  //           placed = true;
  //         }
  //       }
  //     }

  //     if (!placed) {
  //       console.warn(`"${title}" 배치 실패: 조건을 만족할 수 없음`);
  //     }
  //   }

  //   console.log("총 레이어 수:", layerUsage.filter(Boolean).length);
  //   layerUsage.forEach((count, i) => {
  //     console.log(`레이어 ${i}번: ${count}개 타이틀`);
  //   });

  //   setTextMeshes([...gridMeshes, ...newMeshes]);
  // }

  function createPolygonTextMeshes(polygon: Feature<Polygon>, name: string) {
    if (!notes?.length) return;

    const titles = notes
      .map((note) => note.title)
      .sort((a, b) => b.length - a.length);

    // 1. 폴리곤 bbox 계산
    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;
    polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    const cellSize = 2;
    const gridCols = Math.ceil(lngSpan / cellSize);
    const gridRows = Math.ceil(latSpan / cellSize);
    const lngStep = lngSpan / gridCols;
    const latStep = latSpan / gridRows;

    const grid: (null | { lat: number; lng: number })[][] = Array.from(
      { length: gridRows },
      (_, row) =>
        Array.from({ length: gridCols }, (_, col) => {
          const lng = minLng + col * lngStep + lngStep / 2;
          const lat = maxLat - row * latStep - latStep / 2;
          const inside = turf.booleanPointInPolygon(
            turf.point([lng, lat]),
            polygon
          );
          return inside ? { lat, lng } : null;
        })
    );

    const used: boolean[][] = Array.from({ length: gridRows }, () =>
      Array(gridCols).fill(false)
    );
    const placed: React.JSX.Element[] = [];

    const isSafe = (row: number, col: number) => {
      if (!grid[row]?.[col]) return false;
      let adjacent = 0;
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
      ]) {
        if (used[row + dr]?.[col + dc]) adjacent++;
      }
      return adjacent <= 1 && !used[row][col];
    };

    const tryPlace = (text: string): boolean => {
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          // 한 줄 배치 가능 여부
          const fits = Array.from({ length: text.length }, (_, i) =>
            isSafe(row, col + i)
          ).every(Boolean);

          if (fits) {
            for (let i = 0; i < text.length; i++) {
              const { lat, lng } = grid[row][col + i]!;
              used[row][col + i] = true;

              const phi = ((90 - lat) * Math.PI) / 180;
              const theta = (-(lng + 180) * Math.PI) / 180;
              const radius = 1.011;
              const x = radius * Math.sin(phi) * Math.cos(theta);
              const y = radius * Math.cos(phi);
              const z = radius * Math.sin(phi) * Math.sin(theta);

              const posVec = new THREE.Vector3(x, y, z);
              const lookAtMatrix = new THREE.Matrix4();
              lookAtMatrix.lookAt(
                posVec,
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1, 0)
              );
              const rotation = new THREE.Euler().setFromRotationMatrix(
                lookAtMatrix
              );

              const lng2 = lng + lngStep;
              const theta2 = (-(lng2 + 180) * Math.PI) / 180;
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
              const fontSize = v1.distanceTo(v2) * 0.6;

              placed.push(
                <Text
                  key={`${text}-${i}`}
                  position={[x, y, z]}
                  fontSize={fontSize}
                  rotation={[rotation.x, rotation.y, rotation.z]}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {text[i]}
                </Text>
              );
            }
            return true;
          }
        }
      }
      return false;
    };

    for (const title of titles) {
      tryPlace(title);
    }

    setTextMeshes(placed);
  }

  return (
    <>
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="steelblue" transparent opacity={0.7} />
      </mesh>
      <GlobeLines />
      {textMeshes}
      <PinMarker />
    </>
  );
}
