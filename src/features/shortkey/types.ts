/** shortkey 엔진 · 시트 키 바인딩 타입 */

import type { SheetShortkeyId } from './model/default-sheet-shortkey-masks';

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
	/** starttime / endtime 포커스 */
	isTimeTarget: () => boolean;
	hasFocus: () => boolean;
	isMultiple: () => boolean;
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
	/** multiple 모드 토글 */
	toggleMultiple: () => void;
	/** Space — multiple 중 현재 행 토글 */
	toggleRowSelect: () => void;
	/** 현재 행 뒤 삽입 */
	insertRow: () => void;
	/** 현재 행 삭제 */
	removeRow: () => void;
	/** bold / italic / underline — multiple·에딧·단건 clip */
	applyTextFormat: (command: 'bold' | 'italic' | 'underline') => void;
	/** Ctrl+Z — 에딧 중이 아닐 때만 (에딧 중은 네이티브) */
	undo: () => void;
	/** Ctrl+Y */
	redo: () => void;
	/** Backspace/Delete — text/memo 셀 비우기 (비에딧) */
	clearCell: () => void;
	/** Ctrl+X — 비에딧 text/memo cut */
	clipCut: () => void;
	/** Ctrl+C — 비에딧 text/memo copy */
	clipCopy: () => void;
	/** Ctrl+V — 비에딧 text/memo paste */
	clipPaste: () => void;
	/** Ctrl++ — 시간 ±jump (time 타깃·multiple) */
	timePlus: () => void;
	/** Ctrl+- */
	timeMinus: () => void;
	/** Ctrl+` — 플레이어 현재 시각 → 포커스 time 셀 */
	timeCarve: () => void;
	/** Ctrl+Q — 현재 행 start로 플레이어 seek */
	videoJump: () => void;
	/** Alt+Q — 재생 중 출력 행으로 시트 포커스·스크롤 (영상 seek 없음) */
	sheetJump: () => void;
	/** Ctrl+Space — 재생/일시정지 */
	videoPlayToggle: () => void;
	/** Ctrl+← — −10초 */
	videoSeekPrev: () => void;
	/** Ctrl+→ — +10초 */
	videoSeekNext: () => void;
	/** Ctrl+↑ — 볼륨 +0.1 */
	volumeUp: () => void;
	/** Ctrl+↓ — 볼륨 −0.1 */
	volumeDown: () => void;
}

export interface UseSheetShortkeyParams {
	getActions: () => SheetShortkeyActions;
}
