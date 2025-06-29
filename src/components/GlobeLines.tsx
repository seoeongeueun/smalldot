import React from "react";
import { useEffect, useState } from "react";
import * as THREE from "three";
import type { Feature } from "geojson";

export default function GlobeLines() {
  const [lines, setLines] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then((geojson: { features: Feature[] }) => {
        const _lines: React.JSX.Element[] = [];
        let lineId = 0; // 전체 고유 ID

        geojson.features.forEach((feature, featureIndex) => {
          const geometry = feature.geometry;
          const type = geometry.type;

          if (type === "Polygon") {
            const coords = geometry.coordinates as number[][][];
            coords.forEach((ring) =>
              _lines.push(makeLine(ring, featureIndex, lineId++))
            );
          } else if (type === "MultiPolygon") {
            const coords = geometry.coordinates as number[][][][];
            coords.forEach((polygon) => {
              polygon.forEach((ring) =>
                _lines.push(makeLine(ring, featureIndex, lineId++))
              );
            });
          }
        });
        setLines(_lines);
      });
  }, []);

  function makeLine(
    ring: number[][],
    featureIndex: number,
    uniqueIndex: number
  ): React.JSX.Element {
    const points = ring.map(([lng, lat]) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = (-(lng + 180) * Math.PI) / 180;
      const r = 1;

      //구면 좌표계를 3d 좌표계로 변환
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    });

    const key = `feature-${featureIndex}-line-${uniqueIndex}`;

    const geometry = new (THREE as any).BufferGeometry();
    geometry.setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: "aquamarine" });
    const line = new THREE.Line(geometry, material);

    return <primitive key={key} object={line} />;
  }

  return <>{lines}</>;
}
