import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShortkeyStore } from '../types';
import { DEFAULT_SHEET_SHORTKEY_MASKS } from './default-sheet-shortkey-masks';
import { STORAGE_KEY_SHORTKEY, mergeMasks, toSaveMasks } from './shortkey-storage';
import { normalizeMask } from '@/shared/lib/shortcuts';

/** shortkey mask 스토어 — localStorage 영속, 변경분만 저장 */
const useShortkeyStore = create<ShortkeyStore>()(
  persist(
    (set) => ({
      masks: { ...DEFAULT_SHEET_SHORTKEY_MASKS },

      setMask: (id, mask) => {
        set((state) => ({
          masks: {
            ...state.masks,
            [id]: normalizeMask(mask),
          },
        }));
      },

      resetMasks: () => {
        set({ masks: { ...DEFAULT_SHEET_SHORTKEY_MASKS } });
      },
    }),
    {
      name: STORAGE_KEY_SHORTKEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ masks: toSaveMasks(state.masks) }),
      merge: (persisted, current) => ({
        ...current,
        masks: mergeMasks(persisted, current.masks),
      }),
    },
  ),
);

export { useShortkeyStore };
