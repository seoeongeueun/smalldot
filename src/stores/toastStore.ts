// 글로벌 토스트 메세지를 저장
import { create } from "zustand";

interface ToastStore {
  toast: {
    message: string;
    isError: boolean;
  } | null;
  setToast: (message: string, isError?: boolean) => void;
  reset: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  setToast: (message, isError = false) => set({ toast: { message, isError } }),
  reset: () => set({ toast: null }),
}));
