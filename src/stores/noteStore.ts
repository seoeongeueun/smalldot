//클릭된 메모의 정보를 저장
import { create } from "zustand";
import type { Note } from "@/types/database";

interface NoteStore {
  note: Note | null;
  setNote: (note: Note) => void;
  editNote: <K extends keyof Note>(key: K, value: Note[K]) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  note: null,
  setNote: (note: Note) => set({ note }),
  editNote: (key, value) =>
    set((s) => (s.note ? { note: { ...s.note, [key]: value } } : {})),
  reset: () => set({ note: null }),
}));
