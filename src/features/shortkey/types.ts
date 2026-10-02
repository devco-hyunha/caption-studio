/** shortkey 엔진 · 시트 키 바인딩 타입 */

import type { SheetShortkeyId } from './model/default-sheet-key-masks';

export type ShortcutType = 'down' | 'hold' | 'up';

/** document keydown 핸들러 — React.KeyboardEvent와 구분 */
export type ShortcutKeyHandler = (event: KeyboardEvent) => void;

export interface ShortkeyStore {
	masks: Record<SheetShortkeyId, string>;
	setMask: (id: SheetShortkeyId, mask: string) => void;
	resetMasks: () => void;
}

export interface ShortcutParams {
	mask: string;
	handler: ShortcutKeyHandler;
	type?: ShortcutType;
	list?: string;
	preventDefault?: boolean;
	enableInInput?: boolean;
	placeholder?: string;
}

export interface ShortcutsApi {
	code: Record<string, string | string[]>;
	callback: (fn: ShortcutKeyHandler | null) => void;
	start: (list?: string) => ShortcutsApi;
	stop: () => ShortcutsApi;
	add: (params: ShortcutParams) => ShortcutsApi;
	remove: (params: Pick<ShortcutParams, 'mask' | 'type' | 'list'>) => ShortcutsApi;
	removeAll: () => void;
	search: (mask: string) => boolean;
}

/** 시트 이동 — shortkey가 호출하는 API */
export interface SheetShortkeyMoveActions {
	moveTabNext: ShortcutKeyHandler;
	moveTabPrev: ShortcutKeyHandler;
	moveRowPrev: ShortcutKeyHandler;
	moveRowNext: ShortcutKeyHandler;
	moveColPrev: ShortcutKeyHandler;
	moveColNext: ShortcutKeyHandler;
	movePagePrev: ShortcutKeyHandler;
	movePageNext: ShortcutKeyHandler;
}

/** `/edit` 시트가 shortkey에 주입하는 동작 API (위젯 → feature, 역참조 없음) */
export interface SheetShortkeyActions extends SheetShortkeyMoveActions {
	isEditing: () => boolean;
	isTextTarget: () => boolean;
	hasFocus: () => boolean;
	/** Tab 직전 등 — 커밋 후 focus 유지 */
	endEdit: (commit?: boolean) => void;
	/** F2 / Enter(비에딧) — 기존 값 로드 */
	beginEdit: () => void;
	/** Esc — 값 취소, focus 유지 */
	cancelEdit: () => void;
	/** printable / IME — 타입 투 리플레이스 (지연 setMode) */
	beginEditFromTyping: ShortcutKeyHandler;
	/** Enter(에딧 중) — 줄바꿈 */
	insertEditorLineBreak: () => void;
}

export interface UseSheetShortkeyParams {
	getActions: () => SheetShortkeyActions;
}
