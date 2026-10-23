import type { ColorList, ColorPersistedState } from '../types';
import { DEFAULT_COLOR_LIST, mergeColorList } from '../lib/color-list';

const STORAGE_KEY_COLOR = 'CaptionColorTemp';

/** 레거시 `CaptionColorTemp`는 배열 JSON(`["#ff0000",...]`), persist는 `{state:{colors}}` 래퍼 */
const isLegacyArray = (parsed: unknown): parsed is ColorList =>
  Array.isArray(parsed) && parsed.every((color) => typeof color === 'string');

/** 스토어 초기/승격 팔레트 — persist 래퍼 우선, 없으면 레거시 배열 승격, 없으면 기본 8 hex */
const loadColors = (): ColorList => {
  if (typeof window === 'undefined') return [...DEFAULT_COLOR_LIST];

  const raw = window.localStorage.getItem(STORAGE_KEY_COLOR);
  if (raw == null || raw === '') return [...DEFAULT_COLOR_LIST];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isLegacyArray(parsed)) return mergeColorList(parsed);
    if (parsed && typeof parsed === 'object') {
      const state = (parsed as ColorPersistedState & { state?: ColorPersistedState }).state;
      if (state && Array.isArray(state.colors)) return mergeColorList(state.colors);
    }
    return [...DEFAULT_COLOR_LIST];
  } catch {
    // corrupt payload — 기본 팔레트
    return [...DEFAULT_COLOR_LIST];
  }
};

export { STORAGE_KEY_COLOR, loadColors };
