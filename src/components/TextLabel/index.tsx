// 나라 면적 위에 배치될 글자 컴포넌트
import { Text } from "@react-three/drei";
import * as THREE from "three";

export default function TextLabel({
  letter,
  position,
  rotation,
  fontSize,
}: {
  letter: string;
  position: [x: number, y: number, z: number];
  rotation: THREE.Euler;
  fontSize: number;
}) {
  return (
    <Text
      font="/fonts/Galmuri11-Condensed.ttf"
      position={position}
      rotation={rotation}
      fontSize={fontSize}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {letter.toUpperCase()}
    </Text>
  );
}
