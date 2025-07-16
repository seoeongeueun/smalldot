import { Cone } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useClickStore } from "@/stores/clickStore";
import gsap from "gsap";

export default function PinMarker() {
  const click = useClickStore((s) => s.click);
  const coneRef = useRef<THREE.Mesh>(null);

  //위도 경도를 3d 좌표로 변환
  const position = useMemo<THREE.Vector3 | null>(() => {
    if (click?.lat != null && click?.lon != null) {
      return latLonToVec3(click.lat, click.lon);
    }
    return null;
  }, [click?.lat, click?.lon]);

  //포인트가 지구 중심을 바라보게 회전 조절
  useEffect(() => {
    if (coneRef.current) {
      coneRef.current.lookAt(0, 0, 0);
      coneRef.current.rotateX(Math.PI / 2);

      // 기존 gsap 애니메이션 제거 (중복 방지)
      gsap.killTweensOf(coneRef.current.scale);

      coneRef.current.scale.set(1, 0.001, 1);

      requestAnimationFrame(() => {
        gsap.to(coneRef.current!.scale, {
          y: 1,
          duration: 0.9,
          ease: "elastic.out(1.5, 0.3)",
        });
      });
    }
  }, [position]);

  if (!position) return null;

  return (
    <Cone ref={coneRef} args={[0.01, 0.04, 6]} position={position.toArray()}>
      <meshBasicMaterial color="red" />
    </Cone>
  );
}

function latLonToVec3(lat: number, lon: number, radius = 1.02) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (-(lon + 180) * Math.PI) / 180;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
