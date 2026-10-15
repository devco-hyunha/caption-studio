import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale } from '@/shared/types/locale';
import type { LocaleStore } from './types';
import {
  DEFAULT_LOCALE,
  STORAGE_KEY_LOCALE,
  loadLocale,
  mergeState,
  toSaveValue,
} from './locale-storage';
import { migrateLanguage } from './migrate';
import { en, ja, ko } from '../dictionaries/dictionaries';

const locales: Record<Locale, Record<string, string>> = { ko, en, ja };

/** `/`(`storage.js`)와 공유하는 `locale` 키 — persist payload를 `/` 호환 JSON 문자열로 변환 */
const createLocaleStorage = () => ({
  getItem: () => {
    const locale = loadLocale();
    return JSON.stringify({ state: { locale } });
  },
  setItem: (_name: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      const parsed = JSON.parse(value) as { state?: { locale?: Locale } };
      const save = toSaveValue(parsed.state ?? null);
      if (save == null) return;
      window.localStorage.setItem(STORAGE_KEY_LOCALE, save);
    } catch {
      // ignore corrupt persist payload
    }
  },
  removeItem: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY_LOCALE);
    } catch {
      // ignore
    }
  },
});

/** 로케일 스토어 — localStorage `locale` 영속 (`/` settings/language.js parity) */
const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,

      setLanguage: (lang) => {
        set({ locale: migrateLanguage(lang) });
      },

      t: (key) => locales[get().locale]?.[key] ?? key,
    }),
    {
      name: STORAGE_KEY_LOCALE,
      storage: createJSONStorage(() => createLocaleStorage()),
      partialize: (state) => ({ locale: state.locale }),
      merge: (persisted, current) => ({
        ...current,
        ...mergeState(persisted, { locale: current.locale }),
      }),
    },
  ),
);

export { useLocaleStore };
