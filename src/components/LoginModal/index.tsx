import AuthForm from "../AuthForm";
import { useState, useEffect, useRef } from "react";
import UserModal from "../UserModal";
import gsap from "gsap";
import clsx from "clsx";

export default function LoginModal() {
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement>(null);

  //   useEffect(() => {
  //     const modal = modalRef.current;
  //     if (!modal) return;

  //     requestAnimationFrame(() => {
  //       const height = modal.clientHeight;
  //       console.log("measured height:", height);

  //       gsap.set(modal, { opacity: 0, height: 0 });

  //       gsap.to(modal, {
  //         opacity: 1,
  //         height: height,
  //         duration: 1,
  //         ease: "back.inOut(1.3)",
  //       });
  //     });
  //   }, []);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const height = modal.clientHeight + 5;

    gsap.set(modal, { opacity: 0, height: 0 });
    gsap.to(modal, {
      opacity: 1,
      height: height,
      duration: 1,
      ease: "back.inOut(1.5)",
      clearProps: "height",
    });
  }, [isPreview]);

  return (
    <dialog
      ref={modalRef}
      open
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-70 flex flex-col border border-theme border-px rounded-px pointer-events-auto bg-black/80 overflow-hidden backdrop-blur-xs p-4 text-white h-fit"
    >
      {isPreview ? (
        <UserModal isLogin={false} setIsPreview={setIsPreview} />
      ) : (
        <AuthForm />
      )}
    </dialog>
  );
}
