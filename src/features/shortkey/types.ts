/** shortkey 시트 키 바인딩 타입 (S2: 이동·에딧·선택·CRUD) — 엔진 규격은 shared */

import type { ShortcutKeyHandler } from '@/shared/types/shortkey';
import type { SheetShortkeyId } from './model/default-sheet-shortkey-masks';

/** mask 저장 맵 — 부분집합 (persist merge·legacy 승격용) */
export type ShortkeyMasks = Partial<Record<SheetShortkeyId, string>>;

/** localStorage `shortkeyMasks` persist partialize 결과 */
export interface ShortkeyPersistedState {
	masks: ShortkeyMasks;
}

export interface ShortkeyStore {
	masks: Record<SheetShortkeyId, string>;
	setMask: (id: SheetShortkeyId, mask: string) => void;
	resetMasks: () => void;
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
	isMultiple: () => boolean;
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
}

export interface UseSheetShortkeyParams {
	getActions: () => SheetShortkeyActions;
}
