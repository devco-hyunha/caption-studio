/** modifier 정본 — mask 빌드·파싱·라벨·입력이 공유하는 단일 소스. 순서 = mask 빌드 순(ctrl·alt·shift·meta) */

import type { ModifierState, ModifierToken } from '@/shared/types/shortkey';

const MODIFIER_TOKENS = [
  'ctrl',
  'alt',
  'shift',
  'meta',
] as const satisfies readonly ModifierToken[];

/** event.key lowercase 명 — keydown 입력에서 modifier 단독 키 필터 */
const MODIFIER_KEYS = new Set(['control', 'alt', 'shift', 'meta']);

/** mask 토큰 → 표시 라벨 (meta는 Mac 기호) */
const MODIFIER_LABELS: Record<ModifierToken, string> = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  meta: '⌘',
};

/** mask 토큰 → keydown event 상태 필드 */
const MODIFIER_STATE_KEYS = {
  ctrl: 'ctrlKey',
  alt: 'altKey',
  shift: 'shiftKey',
  meta: 'metaKey',
} as const satisfies Record<ModifierToken, keyof ModifierState>;

/** modifier 이벤트 code — mask key 빌드에서 code 키 제외 */
const MODIFIER_CODES = new Set([
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'ShiftLeft',
  'ShiftRight',
  'MetaLeft',
  'MetaRight',
]);

/** normalize된 mask 토큰이 modifier인지 — getMaskObject·getKey 게이트 (타입 가드) */
const isModifierToken = (token: string): token is ModifierToken =>
  (MODIFIER_TOKENS as readonly string[]).includes(token);

export {
  MODIFIER_CODES,
  MODIFIER_KEYS,
  MODIFIER_LABELS,
  MODIFIER_STATE_KEYS,
  MODIFIER_TOKENS,
  isModifierToken,
};
