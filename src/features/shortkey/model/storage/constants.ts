import type { SheetShortkeyId } from '../../types';
import { SHORTKEY_IDS } from '../keys/ids';

const STORAGE_KEY_SHORTKEY = 'shortkeyMasks';

/** 구 커스텀 키 localStorage 접두사 — `<prefix><storageId>` */
const LEGACY_CUSTOM_KEY_PREFIX = 'customkey-';

/** 구 `customkey-<storageId>` → 시트 mask id (값은 JSON 문자열) */
const LEGACY_SHORTKEY_STORAGE_IDS: Record<string, SheetShortkeyId> = {
  'sheet-insert': SHORTKEY_IDS.SHEET_INSERT,
  'sheet-remove': SHORTKEY_IDS.SHEET_REMOVE,
  plus: SHORTKEY_IDS.TIME_PLUS,
  minus: SHORTKEY_IDS.TIME_MINUS,
};

export { LEGACY_CUSTOM_KEY_PREFIX, LEGACY_SHORTKEY_STORAGE_IDS, STORAGE_KEY_SHORTKEY };
