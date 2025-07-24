import type { GridCell } from "../GlobeMesh";
import { Line } from "@react-three/drei";

export default function GridCells({ lines }: { lines: GridCell[] }) {
  return (
    <>
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={line.points}
          color="cyan"
          lineWidth={0.25}
          transparent
          opacity={0.3}
        />
      ))}
    </>
  );
}
