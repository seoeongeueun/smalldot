import { useState, useRef, useEffect, FormEvent } from "react";
import clsx from "clsx";
import { useNoteStore } from "@/stores/noteStore";
import gsap from "gsap";
import { formatTimestamp } from "@/utils/helpers";
import { useNotes } from "@/hooks/useNotes";
import { useToastStore } from "@/stores/toastStore";
import { DayPicker } from "react-day-picker";
import { isSameDay } from "date-fns";
import { getKeywordsFromText } from "@/lib/geminiAnalyzer";

type Mode = "edit" | "delete" | "default";

export default function Note() {
  const { note, reset, editNote } = useNoteStore();
  const setToast = useToastStore((s) => s.setToast);
  const { deleteNote, updateNote } = useNotes();

  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("default");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const noteRef = useRef<HTMLFormElement>(null);

  //처음 로드 되었을 때 글자 수를 저장 (나중에 얼마나 바꼈는지 계산하는 용도)
  const [contentLength, setContentLength] = useState<number>(
    note?.content.length ?? 0
  );

  const TEXT_DIFF_RATIO = 0.2; // 글자 수가 바뀐 정도 기준 (현재 20%)
  const TEXT_TIME_DIFF = 30_000; // 마지막으로 업데이트 된 시각과의 최소 차이 (현재 30초)

  useEffect(() => {
    const noteBox = noteRef.current;
    if (!noteBox) return;

    setContentLength(note?.content.length ?? 0);

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

  const handleSaveNote = async (e: FormEvent) => {
    e.preventDefault();

    if (!note?.id) {
      setToast("Unexpected Error");
      return;
    }

    //최소 40초 이상 전에 마지막으로 수정되었고 글자 수가 기준 이상 변한 경우에만 제미나이로 타이틀 갱신
    let shouldUpdateTitle =
      note?.updated_at &&
      Date.now() - new Date(note.updated_at).getTime() >= TEXT_TIME_DIFF &&
      Math.abs(contentLength - note.content.length) / contentLength >=
        TEXT_DIFF_RATIO;

    console.log(
      shouldUpdateTitle,
      Math.abs(contentLength - note.content.length) / contentLength,
      Date.now() - new Date(note.updated_at!).getTime()
    );

    let newTitle = note.title;

    try {
      if (shouldUpdateTitle) {
        newTitle = (await getKeywordsFromText(note.content)) || note.title;
      }

      await updateNote.mutateAsync({
        id: note.id,
        title: newTitle,
        content: note.content,
        date: selectedDate?.toISOString() ?? note.date,
        country_code: note.country_code,
      });

      editNote({
        title: newTitle,
        date: selectedDate?.toISOString() ?? note.date,
        updated_at: new Date().toISOString(),
      });
      setContentLength(note.content.length); //수정 되었으니까 글자 수도 갱신
      setToast("Saved");
    } catch (error) {
      setToast("Failed to save", true);
    } finally {
      setMode("default");
      setOpenCalendar(false);
    }
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

  //오늘 날짜가 선택된 경우 시간까지 반영되게 별도로 저장
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isSameDay(date, new Date())) setSelectedDate(new Date());
    else setSelectedDate(date);
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
    <form
      ref={noteRef}
      onSubmit={handleSaveNote}
      id="note-container"
      className="z-30 pointer-events-auto w-60 p-4 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-1/2 h-fit text-white border border-px rounded-xs border-theme bg-black/70 backdrop-blur-xs flex flex-col items-start justify-start gap-1"
    >
      <header className="flex flex-row justify-end items-center w-full">
        <h2 className="mr-auto line-clamp-1 p-1">{note?.title}</h2>

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
        onChange={(e) => editNote({ content: e.target.value })}
        rows={10}
      ></textarea>
      {mode === "edit" ? (
        <fieldset className="w-full flex flex-row items-center justify-end relative gap-1">
          <legend className="sr-only">Edit note date</legend>
          {selectedDate && (
            <button
              type="button"
              aria-label="Reset date"
              onClick={() => setSelectedDate(undefined)}
              className="w-6 h-6 hover:animate-spin"
            >
              <i className="hn hn-refresh text-[0.8rem]"></i>
            </button>
          )}
          <output htmlFor="note-date">
            {formatTimestamp(selectedDate?.toISOString() || note?.date)}
          </output>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openCalendar}
            aria-controls="calendar-dialog"
            onClick={() => setOpenCalendar((prev) => !prev)}
            className="w-6 h-6 mb-px"
          >
            <i
              className={clsx(
                "hn hn-calender text-[1rem] mb-1",
                openCalendar ? "text-theme" : "text-white"
              )}
            ></i>
          </button>
          {openCalendar && (
            <dialog
              id="calendar-dialog"
              open
              className="calendar z-40 absolute bottom-[2.2rem] left-[calc(100%-1.5rem)] max-w-50 w-fit bg-black/80 backdrop-blur-xs p-3 rounded-xs border border-px border-white"
            >
              <DayPicker
                mode="single"
                captionLayout="dropdown"
                hideNavigation
                selected={selectedDate}
                onSelect={handleDateSelect}
              ></DayPicker>
            </dialog>
          )}
        </fieldset>
      ) : (
        <span className="ml-auto">{formatTimestamp(note?.date)}</span>
      )}
    </form>
  );
}
