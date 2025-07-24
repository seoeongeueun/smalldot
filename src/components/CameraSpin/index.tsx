import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";

export default function CameraSpin() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const hasLanded = sessionStorage.getItem("landed");

    if (hasLanded === "true") return;

    const startZ = 8;
    const endZ = 2.5;
    const rotationDuration = 2;
    const zoomDuration = 2;

    // 초기 카메라 설정
    camera.position.set(0, 0, startZ);
    camera.lookAt(0, 0, 0);

    const data = { theta: 0, z: startZ };
    const tl = gsap.timeline();

    tl.to(
      data,
      {
        theta: Math.PI * 2,
        duration: rotationDuration,
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
        z: endZ,
        duration: zoomDuration,
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
