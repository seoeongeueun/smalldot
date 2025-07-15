import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlobeMesh from "./components/GlobeMesh";
import StarField from "./components/StarField";
import Menu from "./components/Menu";
import { useGeoStore } from "./stores/geoStore";
import { useEffect } from "react";

export default function App() {
  const setGeojson = useGeoStore((s) => s.setGeojson);

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then(setGeojson);
  }, []);

  return (
    <>
      <Canvas
        shadows
        // camera={{
        //   position: [0, 0, 0.9], // 구 내부 표면 근처
        //   near: 0.001,
        //   far: 100,
        //   fov: 75,
        // }}
        className="globe-canvas"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[1, 1, 10]} intensity={0.3} castShadow />
        <OrbitControls enableZoom={true} />
        {/* 지구본 테두리 */}
        <GlobeMesh />
        <StarField />
      </Canvas>
      <Menu />
    </>
  );
}
