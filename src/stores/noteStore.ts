//클릭된 메모의 정보를 저장
import { create } from "zustand";
import type { Note } from "@/types/database";

interface NoteStore {
  note: Note | null;
  setNote: (note: Note) => void;
  editNote: (fields: Partial<Note>) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  note: null,
  setNote: (note: Note) => set({ note }),
  editNote: (fields) =>
    set((s) => (s.note ? { note: { ...s.note, ...fields } } : {})),
  reset: () => set({ note: null }),
}));
