import { useEffect, useState } from "react";
import * as THREE from "three";
import * as turf from "@turf/turf";
import earcut from "earcut";
import { useThree } from "@react-three/fiber";
import GlobeLines from "./GlobeLines";

export default function GlobeMesh() {
  const { scene } = useThree();
  const [geojson, setGeojson] = useState(null);
  const [selectedMesh, setSelectedMesh] = useState(null);

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then(setGeojson);
  }, []);

  function handlePointerDown(event) {
    if (!geojson) return;
    const { x, y, z } = event.point;
    const { lat, lon } = cartesianToLatLon(x, y, z);
    const clickedPoint = turf.point([lon, lat]);

    for (const feature of geojson.features) {
      if (turf.booleanPointInPolygon(clickedPoint, feature)) {
        console.log(`✅ ${feature.properties.name}`);
        createPolygonFill(feature);
        return;
      }
    }
  }

  function createPolygonFill(feature) {
    if (selectedMesh) {
      scene.remove(selectedMesh);
    }

    const coords =
      feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];

    // 2D flatten for earcut
    const vertices2D = [];
    const vertices3D = [];

    coords.forEach(([lng, lat]) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = (-(lng + 180) * Math.PI) / 180;
      const r = 1;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      vertices3D.push(x, y, z);
      vertices2D.push(lng, lat);
    });

    const triangles = earcut(vertices2D);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices3D, 3)
    );
    geometry.setIndex(triangles);

    const material = new THREE.MeshBasicMaterial({
      color: "orange",
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthTest: false, // 다른 geometry 깊이를 무시하고 항상 최상단 draw
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    setSelectedMesh(mesh);
  }

  return (
    <>
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="dodgerblue" transparent opacity={0.3} />
      </mesh>
      <GlobeLines />
    </>
  );
}

// === 유틸 ===
function cartesianToLatLon(x, y, z) {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - (Math.acos(y / r) * 180) / Math.PI;
  let lon = (Math.atan2(z, x) * 180) / Math.PI;
  lon = -lon - 180;
  lon = ((lon + 540) % 360) - 180;
  return { lat, lon };
}
