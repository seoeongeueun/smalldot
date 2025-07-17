import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useNoteStore } from "@/stores/noteStore";
import { useClickStore } from "@/stores/clickStore";
import clsx from "clsx";
import { queryClient } from "@/lib/queryClient";
import type { Note } from "@/types/database";

export default function NotesBox() {
  const click = useClickStore((s) => s.click);
  const notes = queryClient.getQueryData<Note[]>([
    "notes",
    click?.feature?.properties?.iso_a3,
  ]);
  const [notesCount, setNotesCount] = useState<number>(notes?.length ?? 0);
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
      className="border border-px rounded-xs border-theme bg-black/40 p-2 w-[8rem] md:w-[12rem] h-auto overflow-y-scroll flex flex-wrap pointer-events-auto"
    >
      {notes &&
        notes.map((n: Note) => (
          <button
            type="button"
            onClick={() => handleOpenNote(n)}
            className={clsx(
              "relative p-2 basis-1/2 md:basis-1/3 w-fit h-min aspect-square overflow-hidden",
              n.id === note?.id ? "text-theme" : "text-white"
            )}
          >
            <i aria-hidden="true" className="hn hn-folder text-[1.6rem]"></i>
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
