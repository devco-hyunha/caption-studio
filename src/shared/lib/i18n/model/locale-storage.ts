import type { Locale } from '@/shared/types/locale';
import type { LocaleState } from './types';
import { STORAGE_KEY_LEGACY_LANGUAGE, STORAGE_KEY_LOCALE, migrateLanguage } from './migrate';

const DEFAULT_LOCALE: Locale = 'ko';

/** 로케일 문자열 여부 */
const isLocale = (value: unknown): value is Locale =>
  value === 'ko' || value === 'en' || value === 'ja';

/** localStorage `locale` 읽기 — 없으면 `language` 키에서 승격 */
const loadLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const read = (key: string): unknown => {
    try {
      return JSON.parse(window.localStorage.getItem(key) as string);
    } catch {
      return null;
    }
  };

  const raw = read(STORAGE_KEY_LOCALE) ?? read(STORAGE_KEY_LEGACY_LANGUAGE);
  const locale = migrateLanguage(raw);
  try {
    window.localStorage.setItem(STORAGE_KEY_LOCALE, JSON.stringify(locale));
  } catch {
    // ignore write failure
  }
  return locale;
};

/** Zustand persist `{ state }` 래퍼 → JSON 문자열로 저장 */
const toSaveValue = (state: { locale?: Locale } | null): string | null => {
  if (!state || !isLocale(state.locale)) return null;
  return JSON.stringify(state.locale);
};

/** persist merge — persisted 우선,非法이면 현행 유지 */
const mergeState = (persisted: unknown, current: LocaleState): LocaleState => {
  if (!persisted || typeof persisted !== 'object') return current;
  const locale = (persisted as LocaleState).locale;
  return isLocale(locale) ? { locale } : current;
};

export { DEFAULT_LOCALE, STORAGE_KEY_LOCALE, loadLocale, mergeState, toSaveValue };
