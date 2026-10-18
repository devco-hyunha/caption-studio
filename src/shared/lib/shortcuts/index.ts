/** shortkey 엔진 public API (도메인 무관) — engine/input/label 계열 루트 barrel */
export { createShortcuts } from './engine/create-shortcuts';
export { checkIsInput } from './engine/check-is-input';
export { createCodeMap } from './engine/code-map';
export { getKey, getMaskObject, normalizeMask } from './engine/mask';
export { convertEventToMask } from './input/convert';
export { isImeKeyEvent } from './input/is-ime-event';
export { isMac, maskToLabel, maskToPrimaryLabel, pickPrimaryMask } from './label/mask-label';
