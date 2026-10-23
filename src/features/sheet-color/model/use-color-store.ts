import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ColorStore } from '../types';
import { STORAGE_KEY_COLOR, loadColors } from './color-storage';

/** color 팔레트 스토어 — 도메인 분리 create() + persist(partialize colors만). 레거시 승격은 loadColors */
const useColorStore = create<ColorStore>()(
  persist(
    (set) => ({
      colors: loadColors(),

      setColor: (index, hex) => {
        set((state) => {
          if (index < 0 || index >= state.colors.length) return state;
          const colors = [...state.colors];
          colors[index] = hex;
          return { colors };
        });
      },
    }),
    {
      name: STORAGE_KEY_COLOR,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ colors: state.colors }),
    },
  ),
);

export { useColorStore };
