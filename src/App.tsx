import { Canvas } from "@react-three/fiber";
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
import SideBar from "./components/SideBar";
import CameraSpin from "./components/CameraSpin";
import LoginModal from "./components/LoginModal";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useModalStore } from "@/stores/modalStore";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";

gsap.registerPlugin(ScrambleTextPlugin);

export default function App() {
  const menuRef = useRef<HTMLDivElement>(null);
  const setGeojson = useGeoStore((s) => s.setGeojson);
  const click = useClickStore((s) => s.click);
  const { note, reset } = useNoteStore();
  const isOpen = useModalStore((s) => s.isOpen);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/world.geo.json")
      .then((res) => res.json())
      .then(setGeojson);
  }, []);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const searchParams = new URLSearchParams(window.location.search);

    const error =
      hashParams.get("error_description") ||
      searchParams.get("error_description");

    if (error?.includes("invalid")) {
      alert("Email has expired or is no longer valid. Please sign up again.");
    }
  }, []);

  // 세션 상태 변경되면 refetch
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    const section = menuRef.current;
    if (!section || !session || !click?.feature) return;

    //섹션의 가장 가까운 자식에 애니메이션 부여
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
  }, [click?.feature, session]);

  useEffect(() => {
    if (!note) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const menu = menuRef.current;
      const noteEl = document.querySelector("#note-container");

      // note 영역이 아닌 곳 클릭한 경우 메모 정보를 삭제해서 메모창 닫기
      if (
        noteEl &&
        !noteEl.contains(e.target as Node) &&
        (!menu || !menu.contains(e.target as Node))
      )
        reset();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [note]);

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
        <CameraSpin />
        <GlobeMesh />
        <StarField />
      </Canvas>
      {session ? (
        <>
          <SideBar />
          {note && <Note />}
          {click?.feature && (
            <section
              ref={menuRef}
              aria-label="Menu"
              className="fixed pointer-events-none bottom-0 justify-self-center w-[94%] sm:w-[92%] lg:w-[40rem] flex flex-col gap-4 justify-start py-2 sm:py-8 text-white"
            >
              <TextBox />
              <div className="flex flex-col sm:flex-row gap-2 min-h-32">
                <Menu />
                <NotesBox />
              </div>
            </section>
          )}
        </>
      ) : (
        isOpen && <LoginModal />
      )}
    </>
  );
}
