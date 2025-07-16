import { useMemo } from "react";
import * as THREE from "three";

export default function StarField() {
  const starData = useMemo(() => {
    const starCount = 500;
    const minDistance = 2;
    const maxDistance = 5;
    const positions = [];
    const sizes = [];

    while (positions.length / 3 < starCount) {
      const radius = THREE.MathUtils.randFloat(minDistance, maxDistance);
      const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);
      sizes.push(THREE.MathUtils.randFloat(0.01, 0.04)); // 별 크기
    }

    const geometry = new (THREE as any).BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    return geometry;
  }, []);

  return (
    <points geometry={starData}>
      <pointsMaterial color="cornsilk" size={0.02} sizeAttenuation />
    </points>
  );
}
