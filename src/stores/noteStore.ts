//클릭된 메모의 정보를 저장
import { create } from "zustand";

interface NoteStore {
  note: {
    id: number | null;
    content: string;
    date: string;
  } | null;
  setNote: (id: number, content: string, date: string) => void;
  updateContent: (content: string) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  note: null,
  setNote: (id, content, date) => set({ note: { id, content, date } }),
  updateContent: (content: string) =>
    set((s) => (s.note ? { note: { ...s.note, content } } : {})),
  reset: () => set({ note: null }),
}));
