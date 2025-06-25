import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlobeLines from "./components/GlobeLines";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} className="globe-canvas">
      <ambientLight />
      <OrbitControls enableZoom={true} />

      <GlobeLines />
    </Canvas>
  );
}
