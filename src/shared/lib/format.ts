import type { Locale } from '@/shared/types/locale';
import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';

/** 소문자 포맷 → 대문자 키. const 타입 파라미터로 literal 유지 */
const toUpperFormat = <T extends SubtitleFormat | SubtitleExportFormat>(format: T): Uppercase<T> =>
  format.toUpperCase() as Uppercase<T>;

/** 소문자 로케일 → 대문자 키 */
const toUpperLocale = (locale: Locale): Uppercase<Locale> =>
  locale.toUpperCase() as Uppercase<Locale>;

export { toUpperFormat, toUpperLocale };
