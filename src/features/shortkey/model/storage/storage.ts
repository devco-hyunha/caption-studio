import type { SheetShortkeyId, ShortkeyMasks, ShortkeyPersistedState } from '../../types';
import { DEFAULT_SHEET_SHORTKEY_MASKS } from '../keys/masks';
import { CUSTOM_SHORTKEY_IDS } from '../keys/custom-ids';
import { isCustomShortkeyId } from '../../lib/settings/custom-mask-validation';
import { normalizeMask } from '@/shared/lib/shortcuts';
import { LEGACY_CUSTOM_KEY_PREFIX, LEGACY_SHORTKEY_STORAGE_IDS } from './constants';

/** localStorage `customkey-*` → mask 맵 승격. 읽은 키는 즉시 제거 — reset 후 재승격(resurrection) 차단 */
const promoteLegacyMasks = (): ShortkeyMasks => {
  if (typeof window === 'undefined') return {};
  const legacy: ShortkeyMasks = {};

  Object.entries(LEGACY_SHORTKEY_STORAGE_IDS).forEach(([storageId, id]) => {
    const raw = window.localStorage.getItem(`${LEGACY_CUSTOM_KEY_PREFIX}${storageId}`);
    if (raw == null) return;
    window.localStorage.removeItem(`${LEGACY_CUSTOM_KEY_PREFIX}${storageId}`);
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
  const merged = { ...current, ...promoteLegacyMasks() };

  if (persisted && typeof persisted === 'object') {
    const masks = (persisted as ShortkeyPersistedState).masks;
    if (masks) {
      Object.entries(masks).forEach(([id, mask]) => {
        // persisted에도 커스텀 id만 반영 (고정키 변경분은 무시)
        if (mask && isCustomShortkeyId(id as SheetShortkeyId, CUSTOM_SHORTKEY_IDS)) {
          merged[id as SheetShortkeyId] = normalizeMask(mask);
        }
      });
    }
  }

  return merged;
};

/** 저장 대상 — 커스텀 id 중 default와 다른 mask만 (변경분만 영속) */
const toSaveMasks = (masks: Record<SheetShortkeyId, string>): ShortkeyMasks => {
  const changed: ShortkeyMasks = {};

  CUSTOM_SHORTKEY_IDS.forEach((id) => {
    if (masks[id] !== DEFAULT_SHEET_SHORTKEY_MASKS[id]) changed[id] = masks[id];
  });

  return changed;
};

export { mergeMasks, toSaveMasks };
