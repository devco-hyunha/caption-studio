/** 커스텀·고정키 id 집합 — ids·labels·검증 의존 */

import type { SheetShortkeyId, ShortkeyLabelId } from '../../types';
import { SHORTKEY_IDS } from './ids';
import { SHORTKEY_LABEL_KEYS } from './labels';
import { isCustomShortkeyId } from '../../lib/settings/custom-mask-validation';

/** 변경 가능한 커스텀 키 id — 이 집합 외 id는 setMask·영속 차단. volumeUp/Down은 고정키 */
export const CUSTOM_SHORTKEY_IDS = [
  SHORTKEY_IDS.SHEET_INSERT,
  SHORTKEY_IDS.SHEET_REMOVE,
  SHORTKEY_IDS.TIME_PLUS,
  SHORTKEY_IDS.TIME_MINUS,
  SHORTKEY_IDS.SEARCH,
  SHORTKEY_IDS.TIME_CARVE,
  SHORTKEY_IDS.VIDEO_JUMP,
  SHORTKEY_IDS.SHEET_JUMP,
  SHORTKEY_IDS.VIDEO_PLAY,
  SHORTKEY_IDS.VIDEO_SEEK_PREV,
  SHORTKEY_IDS.VIDEO_SEEK_NEXT,
  SHORTKEY_IDS.CUE_PREV,
  SHORTKEY_IDS.CUE_NEXT,
] as const satisfies readonly SheetShortkeyId[];

/** 고정키 id (설정 UI kbd 라벨만) — 라벨 있는 고정키. volumeUp/Down 포함. key 집합 정본은 labels — 캐스트 target을 labels에서 파생 */
export const FIXED_SHORTKEY_IDS: readonly ShortkeyLabelId[] = (
  Object.keys(SHORTKEY_LABEL_KEYS) as (keyof typeof SHORTKEY_LABEL_KEYS)[]
).filter((id) => !isCustomShortkeyId(id, CUSTOM_SHORTKEY_IDS));
