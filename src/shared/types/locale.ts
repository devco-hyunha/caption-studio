/** UI 로케일 코드 (신) — 레거시 KRCC/ENCC/JPCC는 migrate로 승격 */
export type Locale = 'ko' | 'en' | 'ja';

/** 로케일 사전 — key → 문자열. `/` `i18n/kr.js`·`en.js`·`jp.js` parity */
export type LocaleDictionary = Record<string, string>;
