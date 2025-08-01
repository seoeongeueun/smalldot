import { create } from "zustand";

type ModalStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen: isOpen }),
}));
