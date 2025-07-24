import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useNoteStore } from "@/stores/noteStore";
import { useClickStore } from "@/stores/clickStore";
import clsx from "clsx";
import type { Note } from "@/types/database";
import { formatMonthDay } from "@/utils/helpers";
import { useNotes } from "@/hooks/useNotes";

export default function NotesBox() {
  const countryCode = useClickStore((s) => s.countryCode);

  const { fetchNotesByCountryCode, fetchNote } = useNotes();
  const { data: notes, isLoading } = fetchNotesByCountryCode(countryCode);

  const containerRef = useRef<HTMLDivElement>(null);
  const { note, setNote, reset } = useNoteStore();

  useEffect(() => {
    const buttons = containerRef.current?.querySelectorAll("button");
    if (!buttons || buttons.length === 0) return;

    const btnArray = Array.from(buttons);

    gsap.set(btnArray, { opacity: 0, y: 20 });
    gsap.to(btnArray, {
      opacity: 1,
      delay: 0.2,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
    });
  }, [notes?.length]);

  const handleOpenNote = (newNote: Note) => {
    if (note?.id === newNote.id) reset();
    else setNote(newNote);
  };

  return (
    <section
      ref={containerRef}
      className={clsx(
        "border border-px backdrop-blur-xs sm:p-2 rounded-xs border-theme bg-black/40 w-full sm:w-[8rem] md:w-[12rem] h-12 sm:min-h-28 sm:h-auto sm:max-h-[calc(5*1.6rem)] sm:gap-y-12 overflow-x-scroll overflow-y-hidden sm:overflow-x-hidden sm:overflow-y-scroll grid-flow-col auto-cols-[2.4rem] sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 pointer-events-auto",
        !notes || notes?.length > 0 ? "grid" : "flex"
      )}
    >
      {!isLoading ? (
        notes && notes.length > 0 ? (
          notes.map((n: Note) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleOpenNote(n)}
              className={clsx(
                "relative px-2 shrink-0 aspect-square overflow-hidden",
                n.id === note?.id ? "text-theme" : "text-white"
              )}
            >
              <i aria-hidden="true" className="hn hn-folder text-[1.6rem]"></i>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !text-[0.5rem] whitespace-nowrap">
                {formatMonthDay(n.date)}
              </span>
            </button>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <i aria-hidden="true" className="hn hn-folder text-[1.6rem]"></i>
            <span className="!text-xxxs tracking-wider">NO RECORD</span>
          </div>
        )
      ) : null}
    </section>
  );
}
