import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlobeMesh from "./components/GlobeMesh";
import StarField from "./components/StarField";
import Menu from "./components/Menu";
import TextBox from "./components/TextBox";
import { useGeoStore } from "./stores/geoStore";
import { useClickStore } from "./stores/clickStore";
import { useEffect, useRef } from "react";
import Note from "./components/Note";
import NotesBox from "./components/NotesBox";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css"; //픽셀 아이콘 라이브러리
import gsap from "gsap";
import { useNoteStore } from "./stores/noteStore";

export default function App() {
  const menuRef = useRef<HTMLDivElement>(null);
  const setGeojson = useGeoStore((s) => s.setGeojson);
  const click = useClickStore((s) => s.click);
  const note = useNoteStore((s) => s.note);

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then(setGeojson);
  }, []);

  useEffect(() => {
    const section = menuRef.current;
    if (!section) return;

    const items = section.querySelectorAll(":scope > *");

    gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.4,
      stagger: {
        each: 0.2,
        from: "end", // 마지막 자식부터 시작
      },
      ease: "back.out(1.7)",
    });
  }, [click?.feature]);

  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [0, 0, 2.5],
          near: 0.001,
          far: 50,
        }}
        className="globe-canvas"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[1, 1, 10]} intensity={0.3} castShadow />
        <OrbitControls enableZoom={true} />
        {/* 지구본 테두리 */}
        <GlobeMesh />
        <StarField />
      </Canvas>
      {note && <Note />}
      {click?.feature && (
        <section
          ref={menuRef}
          aria-label="Menu"
          className="fixed pointer-events-none bottom-0 justify-self-center min-w-1/2 !max-w-[30rem] flex flex-col gap-4 justify-start xs:py-2 py-8 box-content text-white"
        >
          <TextBox />
          <div className="flex flex-row gap-2 h-30 ">
            <Menu />
            <NotesBox />
          </div>
        </section>
      )}
    </>
  );
}
