import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlobeMesh from "./components/GlobeMesh";
import StarField from "./components/StarField";
import Menu from "./components/Menu";
import TextBox from "./components/TextBox";
import { useGeoStore } from "./stores/geoStore";
import { useClickStore } from "./stores/clickStore";
import { useEffect } from "react";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css"; //픽셀 아이콘 라이브러리

export default function App() {
  const setGeojson = useGeoStore((s) => s.setGeojson);
  const click = useClickStore((s) => s.click);

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
      {click?.feature && (
        <section
          aria-label="Menu"
          className="fixed pointer-events-none bottom-0 justify-self-center min-w-1/2 !max-w-[30rem] min-h-40 h-fit flex flex-col gap-4 justify-start xs:py-2 py-8 box-content text-white"
        >
          <TextBox />
          <Menu />
        </section>
      )}
    </>
  );
}
