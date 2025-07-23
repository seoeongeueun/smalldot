import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import styles from "./SideBar.module.css";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { maskEmail } from "@/utils/helpers";

export default function SideBar() {
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const timeouts = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);

  gsap.registerPlugin(ScrambleTextPlugin);

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

  useEffect(() => {
    if (!openSideBar) return;

    const timeouts: number[] = [];
    const intervals: number[] = [];

    const CHARS =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const DELAY_MS = 3000;
    const SCRAMBLE_DURATION = 1000;
    const START_DELAY: [number, number] = [1000, 3000];

    const normalize = (t: string) =>
      t
        .replace(/\u00A0/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    const getRandomDelay = () =>
      START_DELAY[0] + Math.random() * (START_DELAY[1] - START_DELAY[0]);

    const runScrambleLoop = (el: HTMLElement, originalText: string) => {
      const createSpansFrom = (text: string) => {
        el.innerHTML = text
          .split("")
          .map(
            (c) =>
              `<span class="scramble-letter">${c === " " ? "&nbsp;" : c}</span>`
          )
          .join("");
        return Array.from(
          el.querySelectorAll(".scramble-letter")
        ) as HTMLSpanElement[];
      };

      const removeSpans = () => {
        el.innerHTML = "";
      };

      const scrambleOnce = () => {
        const spans = createSpansFrom(originalText);
        const revealTimes = spans.map(() => Math.random() * SCRAMBLE_DURATION);
        const revealed = new Array(spans.length).fill(false);
        const startTime = performance.now();

        const interval = window.setInterval(() => {
          const now = performance.now();
          let allRevealed = true;

          spans.forEach((span, i) => {
            if (revealed[i]) return;

            if (now - startTime >= revealTimes[i]) {
              span.innerHTML =
                originalText[i] === " " ? "&nbsp;" : originalText[i];
              span.classList.add("revealed");
              revealed[i] = true;
            } else {
              allRevealed = false;
              span.textContent =
                CHARS[Math.floor(Math.random() * CHARS.length)];
              span.classList.remove("revealed");
            }
          });

          const isFullyRestored =
            normalize(spans.map((s) => s.textContent).join("")) ===
            normalize(originalText);
          console.log(isFullyRestored);
          if (allRevealed && isFullyRestored) {
            clearInterval(interval);
            const timeout = window.setTimeout(() => {
              removeSpans();
              scrambleOnce(); // 🔁 반복
            }, DELAY_MS + getRandomDelay());
            timeouts.push(timeout);
          }
        }, 50);

        intervals.push(interval);
      };

      const startDelay = getRandomDelay();
      const timeout = window.setTimeout(() => {
        scrambleOnce();
      }, startDelay);
      timeouts.push(timeout);
    };

    const elements = Array.from(
      document.querySelectorAll(".scramble-text")
    ) as HTMLElement[];

    elements.forEach((el) => {
      const originalText = (el.dataset.text || "").trim();
      if (!originalText) return;
      runScrambleLoop(el, originalText);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [openSideBar]);

  useEffect(() => {
    console.log("[Scramble Effect] mounted");

    return () => {
      console.log("[Scramble Effect] cleanup");
    };
  }, []);

  return (
    <div className="fixed top-2 right-2 h-fit p-2 z-40 w-70">
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
        className="bg-black/80 overflow-hidden backdrop-blur-xs border border-px border-theme h-fit w-full absolute inset-0 rounded-xs p-4 text-white "
        aria-label="Sidebar user info"
      >
        {isLogin ? (
          <section className="whitespace-prewrap break-all flex flex-col gap-3">
            <div className="flex flex-row items-center max-w-[calc(100%-2rem)] uppercase gap-2 tracking-wide">
              <h3>AGENT</h3> <h3>USERNAME</h3>
            </div>
            <dl className="text-sm uppercase space-y-1">
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-envelope text-[0.8rem] mb-px"></i>
                <dt className="font-medium">Email:</dt>
                <dd className="ml-auto">{maskEmail("username@gmail.com")}</dd>
              </div>
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-folder-open text-[0.8rem] mb-px"></i>
                <dt className="font-medium">Total Notes:</dt>
                <dd className="ml-auto">9</dd>
              </div>
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-globe-americas text-[0.8rem] mb-px"></i>
                <dt className="font-medium">Most Visited Country:</dt>
                <dd className="ml-auto">KOR</dd>
              </div>
            </dl>
            <button
              type="button"
              className="w-fit border border-px text-white px-2 text-center rounded-xs gap-2 text-xs"
            >
              <i
                className="hn hn-logout text-[0.8rem] mb-px"
                aria-hidden="true"
              ></i>
              SIGN OUT
            </button>
          </section>
        ) : (
          <section className="whitespace-prewrap break-all flex flex-col gap-3">
            <div className="flex flex-row items-center max-w-[calc(100%-2rem)] uppercase gap-2 tracking-wide">
              <h3>AGENT</h3>{" "}
              <h3 className="scramble-text" data-text="unknown"></h3>
            </div>

            <dl className="text-sm uppercase space-y-1">
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-bell-exclaimation text-[0.8rem] mb-px"></i>
                <dt className="font-medium">new assignment:</dt>
                <dd
                  className="ml-auto scramble-text"
                  data-text="join the mission"
                ></dd>
              </div>
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-plane-departure text-[0.8rem] mb-px"></i>
                <dt className="font-medium">setting course to:</dt>
                <dd className="ml-auto scramble-text" data-text="earth"></dd>
              </div>
            </dl>

            {/* <dl className="text-sm uppercase space-y-1">
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-folder-open text-[0.8rem] mb-px"></i>
                <dt className="font-medium">Total Notes:</dt>
                <dd className="ml-auto">???</dd>
              </div>
              <div className="flex flex-row gap-2 justify-start items-center">
                <i className="hn hn-globe-americas text-[0.8rem] mb-px"></i>
                <dt className="font-medium">Most Visited Country:</dt>
                <dd className="ml-auto">???</dd>
              </div>
            </dl> */}

            <div className="flex flex-row justify-between items-center gap-2">
              <button
                type="button"
                className="w-fit border border-px text-white px-2 text-center rounded-xs gap-2 text-xs uppercase"
              >
                <i
                  className="hn hn-login text-[0.8rem] mb-px"
                  aria-hidden="true"
                ></i>
                LOG IN
              </button>
              <button
                type="button"
                className="w-fit border border-px text-white px-2 text-center rounded-xs gap-2 text-xs uppercase"
              >
                <i
                  className="hn hn-upload text-[0.8rem] mb-px"
                  aria-hidden="true"
                ></i>
                SIGN UP
              </button>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
