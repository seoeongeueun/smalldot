import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useNoteStore } from "@/stores/noteStore";
import gsap from "gsap";
import { formatTimestamp } from "@/utils/helpers";
import { useNotes } from "@/hooks/useNotes";
import { useToastStore } from "@/stores/toastStore";

type Mode = "edit" | "delete" | "default";

export default function Note() {
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("default");
  const noteRef = useRef<HTMLDivElement>(null);
  const { note, reset, updateContent } = useNoteStore();
  const { deleteNote } = useNotes();
  const setToast = useToastStore((s) => s.setToast);

  useEffect(() => {
    const noteBox = noteRef.current;
    if (!noteBox) return;

    gsap.set(noteBox, {
      opacity: 0,
      y: 50,
    });

    gsap.to(noteBox, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }, [note?.id]);

  //모드가 바뀌면 무조건 설정창 간소화
  useEffect(() => {
    setOpenSettings(false);
  }, [mode]);

  const handleModeChange = (newMode: Mode) => {
    if (mode === newMode) setMode("default");
    else setMode(newMode);
  };

  const handleSaveNote = () => {
    setMode("default");
  };

  const handleDeleteNote = async (value: boolean) => {
    setMode("default");

    //삭제 요청이 들어온 경우
    if (value && note?.id) {
      try {
        await deleteNote.mutateAsync(note.id); // 비동기로 삭제 실행
        setToast("Deleted");
        reset(); // 상태 초기화
      } catch (error) {
        setToast("Error", true);
      }
    }
  };

  //메모 삭제 확인 모달
  if (mode === "delete")
    return (
      <dialog
        open
        role="alertdialog"
        aria-labelledby="delete-note-title"
        className="z-30 pointer-events-auto p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-50 text-white border border-px rounded-xs border-theme bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-4"
      >
        <h3 id="delete-note-title">Delete this note?</h3>
        <div className="flex flex-row justify-between w-1/2 items-center">
          <button
            type="button"
            onClick={() => handleDeleteNote(true)}
            aria-label="Confirm delete"
          >
            <i aria-hidden="true" className="hn hn-check-circle text-lg"></i>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteNote(false)}
            aria-label="Cancel delete"
          >
            <i aria-hidden="true" className="hn hn-times-circle text-lg"></i>
          </button>
        </div>
      </dialog>
    );

  return (
    <article
      ref={noteRef}
      id="note-container"
      className="z-30 pointer-events-auto w-[92%] sm:w-1/2 min-w-60 p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-1/2 h-fit text-white border border-px rounded-xs border-theme bg-black/70 backdrop-blur-xs flex flex-col items-start justify-start gap-1"
    >
      <header className="flex flex-row justify-end items-center w-full">
        {mode === "edit" ? (
          <textarea
            rows={1}
            className="mr-2 w-full "
            value={
              "Title Title Title Title Title Title Title Title Title Title Title Title"
            }
          ></textarea>
        ) : (
          <h2 className="mr-auto line-clamp-1">{note?.title}</h2>
        )}

        <div className="flex flex-row items-center gap-1">
          <div
            className={clsx(
              "flex flex-row gap-1 rounded-xs border border-px border-theme overflow-hidden transition-all",
              openSettings ? "w-fit" : "w-0"
            )}
          >
            <button
              type="button"
              title="Edit"
              onClick={() => handleModeChange("edit")}
              className="p-1 flex justify-center items-center"
            >
              <i className="hn hn-edit text-[1rem]"></i>
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => handleModeChange("delete")}
              className="p-1 flex justify-center items-center"
            >
              <i className="hn hn-trash-alt text-[1rem]"></i>
            </button>
          </div>
          {mode === "edit" ? (
            <button
              type="submit"
              aria-label="Save Note"
              onClick={() => handleSaveNote()}
              className="flex items-center justify-center p-1 flex items-center justify-center"
            >
              <i className="hn hn-check-circle"></i>
            </button>
          ) : (
            <button
              type="button"
              aria-label="Edit Note"
              className="rotate-45 hover:animate-spin p-1 flex items-center justify-center hover:cursor-pointer"
              onClick={() => setOpenSettings((prev) => !prev)}
            >
              <i className="hn hn-cog"></i>
            </button>
          )}
        </div>
      </header>
      <textarea
        id="note-text"
        readOnly={mode !== "edit"}
        value={note?.content ?? ""}
        onChange={(e) => updateContent(e.target.value)}
        rows={10}
      ></textarea>
      {mode === "edit" ? (
        <textarea
          rows={1}
          className="!w-30 ml-auto text-xs"
          value={formatTimestamp(note?.date) ?? ""}
        ></textarea>
      ) : (
        <span className="ml-auto">{formatTimestamp(note?.date)}</span>
      )}
    </article>
  );
}
