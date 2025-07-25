import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { CAMERA_OPTIONS } from "@/utils/constants";

export default function CameraSpin() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const hasLanded = sessionStorage.getItem("landed");

    if (hasLanded === "true") return;

    // 초기 카메라 설정
    camera.position.set(0, 0, CAMERA_OPTIONS.START_Z);
    camera.lookAt(0, 0, 0);

    const data = { theta: 0, z: CAMERA_OPTIONS.START_Z };
    const tl = gsap.timeline();

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
          sessionStorage.setItem("landed", "true");
        },
      },
      0
    );
  }, []);

  return <OrbitControls ref={controlsRef} enableZoom={true} />;
}
