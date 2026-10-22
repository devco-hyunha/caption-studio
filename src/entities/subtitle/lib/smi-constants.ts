import type { Locale } from '@/shared/types/locale';
import { toUpperLocale } from '@/shared/lib/format';

/** 빈 캡션 텍스트 — parse-srt(건너뛰기)·serialize-smi(쓰기) 공유 */
const SMI_EMPTY_TEXT = '&nbsp;';
/** SMI 기본 제목 — serialize-smi 전용 */
const DEFAULT_SMI_TITLE = 'Caption Studio - (c)2017 DEVCO Studio';

/** UI 로케일(대문자 키) → SMI Class 키. 값은 Class 코드 그대로 */
const LOCALE_TO_SMI_CLASS_KEY: Record<Uppercase<Locale>, string> = {
  KO: 'KRCC',
  EN: 'ENCC',
  JA: 'JPCC',
};

/** Class별 STYLE 조각 (Name / lang) */
const SMI_CLASS_META: Record<string, { name: string; lang: string }> = {
  KRCC: { name: 'Korean', lang: 'ko-KR' },
  ENCC: { name: 'English', lang: 'en-US' },
  JPCC: { name: 'Japanese', lang: 'ja-JP' },
};

const DEFAULT_SMI_CLASS_KEY = 'KRCC';

/** STYLE 본문 — Name/lang → `.KRCC { … }` 내부 문구 */
const formatSmiClassStyle = (name: string, lang: string) =>
  `Name:${name}; lang:${lang}; SAMIType:CC;`;

/** 로케일 프리셋 — Class 키 + Name/lang */
const localeSmiPreset = (locale: Locale) => {
  const classKey = LOCALE_TO_SMI_CLASS_KEY[toUpperLocale(locale)] ?? DEFAULT_SMI_CLASS_KEY;
  const meta = SMI_CLASS_META[classKey] ?? SMI_CLASS_META[DEFAULT_SMI_CLASS_KEY];
  return { classKey, name: meta.name, lang: meta.lang };
};

export {
  DEFAULT_SMI_CLASS_KEY,
  DEFAULT_SMI_TITLE,
  formatSmiClassStyle,
  LOCALE_TO_SMI_CLASS_KEY,
  localeSmiPreset,
  SMI_CLASS_META,
  SMI_EMPTY_TEXT,
};
