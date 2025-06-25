import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlobeMesh from "./components/GlobeMesh";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} className="globe-canvas">
      <ambientLight />
      <OrbitControls enableZoom={true} />
      {/* 지구본 테두리 */}
      <GlobeMesh />
    </Canvas>
  );
}
