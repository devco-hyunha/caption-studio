import type { SheetShortkeyId, ShortkeyMasks, ShortkeyPersistedState } from '../types';
import { DEFAULT_SHEET_SHORTKEY_MASKS, SHORTKEY_IDS } from './default-sheet-shortkey-masks';
import { normalizeMask } from '@/shared/lib/shortcuts';

const STORAGE_KEY_SHORTKEY = 'shortkeyMasks';

/** 구 `customkey-<storageId>` → 시트 mask id (값은 JSON 문자열) */
const LEGACY_SHORTKEY_STORAGE_IDS: Record<string, SheetShortkeyId> = {
  'sheet-insert': SHORTKEY_IDS.SHEET_INSERT,
  'sheet-remove': SHORTKEY_IDS.SHEET_REMOVE,
  plus: SHORTKEY_IDS.TIME_PLUS,
  minus: SHORTKEY_IDS.TIME_MINUS,
};

/** localStorage `customkey-*` → mask 맵 승격 */
const readLegacyMasks = (): ShortkeyMasks => {
  if (typeof window === 'undefined') return {};
  const legacy: ShortkeyMasks = {};

  Object.entries(LEGACY_SHORTKEY_STORAGE_IDS).forEach(([storageId, id]) => {
    const raw = window.localStorage.getItem(`customkey-${storageId}`);
    if (raw == null) return;
    try {
      const mask = normalizeMask(String(JSON.parse(raw)));
      if (mask) legacy[id] = mask;
    } catch {
      // corrupt payload — skip
    }
  });

  return legacy;
};

/** persist 병합 — default → 구 승격 → 저장 masks 순으로 덮어씀 */
const mergeMasks = (persisted: unknown, current: Record<SheetShortkeyId, string>) => {
  const merged = { ...current, ...readLegacyMasks() };

  if (persisted && typeof persisted === 'object') {
    const masks = (persisted as ShortkeyPersistedState).masks;
    if (masks) {
      Object.entries(masks).forEach(([id, mask]) => {
        if (mask) merged[id as SheetShortkeyId] = normalizeMask(mask);
      });
    }
  }

  return merged;
};

/** 저장 대상 — default와 다른 mask만 (변경분만 영속) */
const toSaveMasks = (masks: Record<SheetShortkeyId, string>): ShortkeyMasks => {
  const changed: ShortkeyMasks = {};

  Object.values(SHORTKEY_IDS).forEach((id) => {
    if (masks[id] !== DEFAULT_SHEET_SHORTKEY_MASKS[id]) changed[id] = masks[id];
  });

  return changed;
};

export { STORAGE_KEY_SHORTKEY, mergeMasks, toSaveMasks };
