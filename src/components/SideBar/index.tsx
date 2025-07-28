import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import styles from "./SideBar.module.css";
import gsap from "gsap";
import UserModal from "../UserModal";

export default function SideBar() {
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const sideBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = sideBarRef.current;
    if (!sidebar) return;

    if (openSideBar) {
      gsap.fromTo(
        sidebar,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "back.out(1.6)",
        }
      );
    } else {
      gsap.to(sidebar, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [openSideBar]);

  return (
    <div className="fixed top-2 right-2 h-fit p-2 z-40 w-70 pointer-events-none">
      <button
        type="button"
        onClick={() => setOpenSideBar((p) => !p)}
        className={clsx(
          styles.sidebar,
          "relative float-right pointer-events-auto z-50",
          openSideBar && styles.active
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-10 h-10 text-theme transition-transform duration-500 ease-in-out"
        >
          <g
            strokeWidth="6.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="currentColor"
          >
            <path d="M72 82.286h28.75" />
            <path
              d="M100.75 103.714l72.482-.143c.043 39.398-32.284 71.434-72.16 71.434-39.878 0-72.204-32.036-72.204-71.554"
              fill="none"
            />
            <path d="M72 125.143h28.75" />
            <path
              d="M100.75 103.714l-71.908-.143c.026-39.638 32.352-71.674 72.23-71.674 39.876 0 72.203 32.036 72.203 71.554"
              fill="none"
            />
            <path d="M100.75 82.286h28.75" />
            <path d="M100.75 125.143h28.75" />
          </g>
        </svg>
      </button>
      <aside
        ref={sideBarRef}
        className="bg-black/80 overflow-hidden backdrop-blur-xs border border-px border-theme h-fit w-full absolute inset-0 rounded-xs p-4 text-white flex flex-col opacity-0"
        aria-label="Sidebar user info"
      >
        <UserModal isLogin={true} />
      </aside>
    </div>
  );
}
