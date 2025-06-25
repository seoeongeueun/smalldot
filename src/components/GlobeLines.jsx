import { useEffect, useState } from "react";
import * as THREE from "three";

export default function GlobeLines() {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then((geojson) => {
        const _lines = [];
        geojson.features.forEach((feature) => {
          const type = feature.geometry.type;
          const coords = feature.geometry.coordinates;

          if (type === "Polygon") {
            coords.forEach((ring) => _lines.push(makeLine(ring)));
          } else if (type === "MultiPolygon") {
            coords.forEach((polygon) => {
              polygon.forEach((ring) => _lines.push(makeLine(ring)));
            });
          }
        });
        setLines(_lines);
      });
  }, []);

  function makeLine(ring) {
    const points = ring.map(([lng, lat]) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      const r = 1;
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
      <line geometry={geometry}>
        <lineBasicMaterial color="white" />
      </line>
    );
  }

  return <>{lines}</>;
}
