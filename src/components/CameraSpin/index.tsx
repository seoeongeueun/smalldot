import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { CAMERA_OPTIONS } from "@/utils/constants";
import { useModalStore } from "@/stores/modalStore";
import { useSession } from "@/hooks/useSession";

export default function CameraSpin() {
  const { camera } = useThree();
  const setIsOpen = useModalStore((s) => s.setIsOpen);
  const controlsRef = useRef<any>(null);
  const { data: session } = useSession();

  useEffect(() => {
    //비로그인 상태에서만 애니메이션 재생
    if (session) return;

    // 초기 카메라 설정
    camera.position.set(0, 0, CAMERA_OPTIONS.START_Z);
    camera.lookAt(0, 0, 0);

    const data = { theta: 0, z: CAMERA_OPTIONS.START_Z };
    const tl = gsap.timeline();

    //유저의 회전 제어 충돌 방지
    const controls = controlsRef.current;
    if (controls) controls.enabled = false;

    tl.to(
      data,
      {
        theta: Math.PI * 2,
        duration: CAMERA_OPTIONS.ROTATION_DURATION,
        ease: "power3.out",
        onUpdate: () => {
          camera.position.x = data.z * Math.sin(data.theta);
          camera.position.z = data.z * Math.cos(data.theta);
          camera.lookAt(0, 0, 0);
        },
      },
      0
    ).to(
      data,
      {
        z: CAMERA_OPTIONS.END_Z,
        duration: CAMERA_OPTIONS.ZOOM_DURATION,
        delay: 1.5,
        ease: "back.out(1.1)",
        onUpdate: () => {
          camera.position.x = data.z * Math.sin(data.theta);
          camera.position.z = data.z * Math.cos(data.theta);
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          if (controls) {
            controls.enabled = true;
            controls.update();
          }
          setIsOpen(true);
        },
      },
      0
    );
  }, [session]);

  return <OrbitControls ref={controlsRef} enableZoom={true} />;
}
