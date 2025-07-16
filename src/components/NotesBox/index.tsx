import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function NotesBox() {
  const [notesCount, setNotesCount] = useState<number>(13);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buttons = containerRef.current?.querySelectorAll("button");
    if (!buttons) return;

    gsap.set(buttons, { opacity: 0, y: 20 });

    gsap.to(buttons, {
      opacity: 1,
      delay: 0.2,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
    });
  }, [notesCount]);

  return (
    <section
      ref={containerRef}
      className="border border-px rounded-px border-theme bg-black/40 p-2 w-[8rem] md:w-[12rem] h-full overflow-y-scroll flex flex-wrap pointer-events-auto"
    >
      {Array.from({ length: notesCount }).map((_, i) => (
        <button
          type="button"
          className="hover:text-theme relative p-2 shrink-0 flex items-center justify-center basis-1/2 md:basis-1/3 aspect-square overflow-hidden"
        >
          <i
            aria-hidden="true"
            className="hn hn-folder shrink-1 text-[1.6rem]"
          ></i>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-[0.5rem] whitespace-nowrap">
            {new Intl.DateTimeFormat("en-US", {
              year: "2-digit",
              month: "2-digit",
            }).format(new Date())}
          </span>
        </button>
      ))}
    </section>
  );
}
