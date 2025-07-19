import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useNoteStore } from "@/stores/noteStore";
import { useClickStore } from "@/stores/clickStore";
import clsx from "clsx";
import { queryClient } from "@/lib/queryClient";
import type { Note } from "@/types/database";
import { formatMonthDay } from "@/utils/helpers";

export default function NotesBox() {
  const click = useClickStore((s) => s.click);
  const notes = queryClient.getQueryData<Note[]>([
    "notes",
    click?.feature?.properties?.iso_a3,
  ]);
  const [notesCount, setNotesCount] = useState<number | null>(
    notes?.length ?? null
  );
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

  const handleOpenNote = (newNote: Note) => {
    if (note?.id === newNote.id) reset();
    else setNote(newNote);
  };

  return (
    <section
      ref={containerRef}
      className="border border-px backdrop-blur-xs rounded-xs border-theme bg-black/40 w-full sm:w-[8rem] md:w-[12rem] h-12 sm:min-h-28 leading-4 sm:h-auto overflow-x-scroll overflow-y-hidden sm:overflow-x-hidden sm:overflow-y-scroll flex flex-row sm:flex-wrap items-center pointer-events-auto"
    >
      {/* {notesCount === 0 && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <i aria-hidden="true" className="hn hn-folder text-[1.6rem]"></i>
          <span className="!text-xxxs tracking-wider">NO NOTES</span>
        </div>
      )} */}
      {notes &&
        notes.map((n: Note) => (
          <button
            type="button"
            onClick={() => handleOpenNote(n)}
            className={clsx(
              "relative px-2 shrink-0 sm:px-0 sm:basis-1/2 md:basis-1/3 aspect-square overflow-hidden",
              n.id === note?.id ? "text-theme" : "text-white"
            )}
          >
            <i aria-hidden="true" className="hn hn-folder text-[1.6rem]"></i>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-[0.5rem] whitespace-nowrap">
              {formatMonthDay(n.date)}
            </span>
          </button>
        ))}
    </section>
  );
}
