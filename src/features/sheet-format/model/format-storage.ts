import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SheetFormatState } from '../types';

const STORAGE_KEY_FORMAT = 'format';
const DEFAULT_FORMAT: SubtitleFormat = 'smi';

/** 자막 포맷 문자열 여부 — `/` storage.get('format') 원본 검증 */
const isSubtitleFormat = (value: unknown): value is SubtitleFormat =>
  value === 'smi' || value === 'srt';

/** localStorage `format` 읽기 — `/`는 JSON 문자열(`"smi"`)로 저장. 없으면 기본 `smi` (`/` set.js) */
const loadFormat = (): SubtitleFormat => {
  if (typeof window === 'undefined') return DEFAULT_FORMAT;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_FORMAT);
    if (raw == null || raw === '') return DEFAULT_FORMAT;
    const parsed = JSON.parse(raw) as unknown;
    return isSubtitleFormat(parsed) ? parsed : DEFAULT_FORMAT;
  } catch {
    // corrupt legacy payload — 기본값
    return DEFAULT_FORMAT;
  }
};

/** Zustand persist `{ state }` 래퍼 → `/` 호환 JSON 문자열로 저장 */
const toSaveValue = (state: { format?: SubtitleFormat } | null): string | null => {
  if (!state || !isSubtitleFormat(state.format)) return null;
  return JSON.stringify(state.format);
};

/** persist merge — persisted 우선,非法이면 현행 유지 */
const mergeState = (persisted: unknown, current: SheetFormatState): SheetFormatState => {
  if (!persisted || typeof persisted !== 'object') return current;
  const format = (persisted as SheetFormatState).format;
  return isSubtitleFormat(format) ? { format } : current;
};

export { DEFAULT_FORMAT, STORAGE_KEY_FORMAT, loadFormat, mergeState, toSaveValue };
