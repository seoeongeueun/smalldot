// 나라 면적 위에 배치될 글자 컴포넌트
import { Text } from "@react-three/drei";
import type { TextPlacement } from "@/types/globe";

export default function TextLabel({
  letter,
  position,
  rotation,
  fontSize,
}: TextPlacement) {
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
