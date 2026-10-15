import type { SubtitleFormat } from '@/shared/types/subtitle-format';

/** 시트 포맷 스토어 상태 · localStorage `format` persist partialize 결과 */
interface SheetFormatState {
  format: SubtitleFormat;
}

/** 시트 포맷 스토어 — 영속 format + 전환 액션 */
interface SheetFormatStore extends SheetFormatState {
  setFormat: (format: SubtitleFormat) => void;
}

export type { SheetFormatState, SheetFormatStore };
