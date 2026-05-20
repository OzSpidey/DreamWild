import { create } from "zustand";

interface UIState {
  forgeStep: number;
  setForgeStep: (n: number) => void;
  nextForgeStep: () => void;
  prevForgeStep: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  forgeStep: 0,
  setForgeStep: (n) => set({ forgeStep: n }),
  nextForgeStep: () => set((s) => ({ forgeStep: s.forgeStep + 1 })),
  prevForgeStep: () => set((s) => ({ forgeStep: Math.max(0, s.forgeStep - 1) })),
}));
