/** shortkey 엔진 — 도메인 무관 범용 규격 */

import type { Fn } from './fn';

export type ShortcutType = 'down' | 'hold' | 'up';

/** document keydown 핸들러 — React.KeyboardEvent와 구분 */
export type ShortcutKeyHandler = (event: KeyboardEvent) => void;

export interface ShortcutParams {
  mask: string;
  handler: ShortcutKeyHandler;
  type?: ShortcutType;
  list?: string;
  preventDefault?: boolean;
  enableInInput?: boolean;
  placeholder?: string;
}

/** mask token → event.code 맵 */
export interface CodeMap {
  [token: string]: string | string[];
}

/** mask modifier 토큰 — 순서 = mask 빌드 순(ctrl·alt·shift·meta) */
export type ModifierToken = 'ctrl' | 'alt' | 'shift' | 'meta';

/** keydown modifier presses — convertEventToMask 입력 필드 */
export interface ModifierState {
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/** keydown 입력 — code·key + modifier presses (설정 UI 커스텀 키 변환 입력) */
export interface KeyEventInput extends ModifierState {
  code: string;
  key: string;
}

/** mask 문자열을 파싱한 결과 — modifier · event.code */
export interface MaskObject {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  code?: string | string[];
}

export interface ShortcutsApi {
  code: CodeMap;
  callback: (fn: ShortcutKeyHandler | null) => void;
  start: (list?: string) => ShortcutsApi;
  stop: Fn<ShortcutsApi>;
  add: (params: ShortcutParams) => ShortcutsApi;
  remove: (params: Pick<ShortcutParams, 'mask' | 'type' | 'list'>) => ShortcutsApi;
  removeAll: Fn<void>;
  search: (mask: string) => boolean;
}
