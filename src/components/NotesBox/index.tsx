import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useNoteStore } from "@/stores/noteStore";
import clsx from "clsx";

export default function NotesBox() {
  const [notesCount, setNotesCount] = useState<number>(13);
  const containerRef = useRef<HTMLDivElement>(null);
  const { note, setNote, reset } = useNoteStore();

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

  //TODO: 실제 데이터 연결 후에는 i가 인덱스가 아니라 데이터의 id로 연결 필요
  const handleOpenNote = (i: number) => {
    if (note?.id === i) reset();
    else
      setNote(
        i,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minimveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eacommodo consequat. Duis aute irure dolor in reprehenderit in voluptatevelit esse cillum dolore eu fugiat nulla pariatur. Excepteur sintoccaecat cupidatat non proident, sunt in culpa qui officia deseruntmollit anim id est laborum. Lorem ipsum dolor sit amet, consecteturadipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamcolaboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolorin reprehenderit in voluptate velit esse cillum dolore eu fugiat nullapariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpaqui officia deserunt mollit anim id est laborum.",
        "02/25"
      );
  };

  return (
    <section
      ref={containerRef}
      className="border border-px rounded-px border-theme bg-black/40 p-2 w-[8rem] md:w-[12rem] h-full overflow-y-scroll flex flex-wrap pointer-events-auto"
    >
      {Array.from({ length: notesCount }).map((_, i) => (
        <button
          type="button"
          onClick={() => handleOpenNote(i)}
          className={clsx(
            "relative p-2 shrink-0 flex items-center justify-center basis-1/2 md:basis-1/3 aspect-square overflow-hidden",
            i === note?.id ? "text-theme" : "text-white"
          )}
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
