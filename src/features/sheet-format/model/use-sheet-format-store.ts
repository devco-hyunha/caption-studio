import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SheetFormatStore } from '../types';
import {
  DEFAULT_FORMAT,
  STORAGE_KEY_FORMAT,
  loadFormat,
  mergeState,
  toSaveValue,
} from './format-storage';

/** `/`(`storage.js`)와 공유하는 `format` 키 — persist payload를 `/` 호환 JSON 문자열로 변환 */
const createFormatStorage = () => ({
  getItem: () => {
    const format = loadFormat();
    return JSON.stringify({ state: { format } });
  },
  setItem: (_name: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      const parsed = JSON.parse(value) as { state?: { format?: SubtitleFormat } };
      const save = toSaveValue(parsed.state ?? null);
      if (save == null) return;
      window.localStorage.setItem(STORAGE_KEY_FORMAT, save);
    } catch {
      // ignore corrupt persist payload
    }
  },
  removeItem: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY_FORMAT);
    } catch {
      // ignore
    }
  },
});

/** 시트 포맷 스토어 — localStorage `format` 키 영속 (`/` settings/format.js parity) */
const useSheetFormatStore = create<SheetFormatStore>()(
  persist(
    (set) => ({
      format: DEFAULT_FORMAT,

      setFormat: (format) => {
        set({ format });
      },
    }),
    {
      name: STORAGE_KEY_FORMAT,
      storage: createJSONStorage(() => createFormatStorage()),
      partialize: (state) => ({ format: state.format }),
      merge: (persisted, current) => ({
        ...current,
        ...mergeState(persisted, { format: current.format }),
      }),
    },
  ),
);

export { useSheetFormatStore };
