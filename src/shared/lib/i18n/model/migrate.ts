import type { Locale } from '@/shared/types/locale';

/** 구 UI 언어 키(KRCC/ENCC/JPCC) → 로케일 코드 */
const LEGACY_LANGUAGE_MAP: Record<string, Locale> = {
  KRCC: 'ko',
  ENCC: 'en',
  JPCC: 'ja',
};

const LOCALES = new Set<Locale>(['ko', 'en', 'ja']);

/** UI 로케일 → SMI STYLE lang (BCP-47) */
const LOCALE_TO_SMI_LANG: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

/** UI 로케일 영속 키. `language`는 읽기 전용 승격 소스 */
const STORAGE_KEY_LOCALE = 'locale';
const STORAGE_KEY_LEGACY_LANGUAGE = 'language';

/** 구 `KRCC`/`ENCC`/`JPCC` 및 신 `ko`/`en`/`ja`를 UI 로케일 코드로 통일 */
const migrateLanguage = (raw: unknown): Locale => {
  if (typeof raw !== 'string' || raw === '') return 'ko';
  if (LOCALES.has(raw as Locale)) return raw as Locale;
  const mapped = LEGACY_LANGUAGE_MAP[raw];
  return mapped ?? 'ko';
};

/** UI 로케일 → SMI STYLE lang. 미매칭은 `ko-KR` */
const localeToSmiLang = (locale: Locale): string =>
  LOCALE_TO_SMI_LANG[migrateLanguage(locale)] ?? 'ko-KR';

export {
  migrateLanguage,
  localeToSmiLang,
  LEGACY_LANGUAGE_MAP,
  LOCALE_TO_SMI_LANG,
  STORAGE_KEY_LOCALE,
  STORAGE_KEY_LEGACY_LANGUAGE,
};
