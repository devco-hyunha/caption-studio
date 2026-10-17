/** UI 로케일 코드 — KRCC/ENCC/JPCC는 migrate로 승격 */
export type Locale = 'ko' | 'en' | 'ja';

/** 로케일 사전 — key → 문자열 */
export type LocaleDictionary = Record<string, string>;
