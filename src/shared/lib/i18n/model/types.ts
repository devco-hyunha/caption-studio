import type { Locale } from '@/shared/types/locale';

/** 로케일 스토어 상태 · localStorage `locale` persist partialize 결과 */
interface LocaleState {
  locale: Locale;
}

/** 로케일 스토어 — 영속 locale + 전환 액션 + `t()` */
interface LocaleStore extends LocaleState {
  setLanguage: (lang: unknown) => void;
  t: (key: string) => string;
}

export type { LocaleState, LocaleStore };
