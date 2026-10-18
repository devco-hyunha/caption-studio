import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShortkeyStore } from '../../types';
import { DEFAULT_SHEET_SHORTKEY_MASKS } from '../keys/masks';
import { CUSTOM_SHORTKEY_IDS } from '../keys/custom-ids';
import { isCustomShortkeyId } from '../../lib/settings/custom-mask-validation';
import { STORAGE_KEY_SHORTKEY } from '../storage/constants';
import { mergeMasks, toSaveMasks } from '../storage/storage';
import { normalizeMask } from '@/shared/lib/shortcuts';

/** shortkey mask 스토어 — localStorage 영속, 변경분만 저장. 커스텀 id만 setMask 허용 */
const useShortkeyStore = create<ShortkeyStore>()(
  persist(
    (set) => ({
      masks: { ...DEFAULT_SHEET_SHORTKEY_MASKS },

      setMask: (id, mask) => {
        if (!isCustomShortkeyId(id, CUSTOM_SHORTKEY_IDS)) return;
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
