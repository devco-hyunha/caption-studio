import type {
	ChangeEvent,
	FocusEvent,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent,
	RefObject,
} from 'react';
import type { SearchHit } from '@/features/sheet-search';
import type {
	SheetShortkeyActions,
	SheetShortkeyMoveActions,
	SheetTextFormatCommand,
	ShortcutKeyHandler,
} from '@/features/shortkey';
import type {
	RowHeightInfo,
	SheetColumnId,
	SheetFormat,
	SheetMoveCursor,
	SheetRowView,
} from './primitives';
import type { SheetCellEditorMode, SheetTabView } from './props';

export interface UseSheetsResult {
	tabs: SheetTabView[];
	activeTabIndex: number;
	rows: SheetRowView[];
	activeScrollTop: number;
	handleScrollTopChange: (scrollTop: number) => void;
	handleSelectTab: (index: number) => void;
	handleAddTab: () => void;
	handleDeleteTab: (index: number) => void;
	handleRenameTab: (index: number, name: string) => boolean;
	handleCopyTab: (index: number) => void;
	handleUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

/** 이동 계산 결과 — applyFocus 대상 커서 + 선택적 스크롤 */
export interface MoveTarget {
	cursor: SheetMoveCursor;
	scrollTop?: number | null;
}

export type MoveCalc = (cursor: SheetMoveCursor) => MoveTarget | 'append' | null;

export interface UseSheetMoveParams {
	format: SheetFormat;
	rows: SheetRowView[];
	/** shortkey용 — `mode === 'edit'` 동기 판별 */
	isEditing: () => boolean;
	currentRowIndex: number | null;
	currentColumn: SheetColumnId | null;
	scrollRef: RefObject<HTMLDivElement | null>;
	endEdit: (commit?: boolean) => void;
	applyFocus: (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => void;
	/** Tab으로 마지막 행 아래 이동 시 행 추가 */
	onAppendRow?: (cursor: SheetMoveCursor) => void;
	/** 행 이동 시 다중 선택 확장 (Shift+Arrow) */
	onRowMoved?: (row: number, withShift: boolean) => void;
}

/** shortkey가 호출하는 이동 API */
export interface UseSheetMoveResult {
	moveTabNext: ShortcutKeyHandler;
	moveTabPrev: ShortcutKeyHandler;
	moveRowPrev: ShortcutKeyHandler;
	moveRowNext: ShortcutKeyHandler;
	moveColPrev: ShortcutKeyHandler;
	moveColNext: ShortcutKeyHandler;
	movePagePrev: ShortcutKeyHandler;
	movePageNext: ShortcutKeyHandler;
}

export interface UseSheetSelectionActionsParams {
	format: SheetFormat;
	rows: SheetRowView[];
	/** 시트 총 높이 — pending focus 대기 조건 */
	totalHeight: number;
	/** 편집 중 여부 */
	isEditing: boolean;
	currentRowIndex: number | null;
	currentColumn: SheetColumnId | null;
	endEdit: (commit?: boolean) => void;
	applyFocus: (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => void;
	/** 행 CRUD 직전 검색 패널 닫기 */
	closeSearchPanel: () => void;
}

export interface UseSheetSelectionActionsResult {
	multipleActive: boolean;
	/** Tab append: 커서 행 아래 삽입 */
	handleAppendRow: (cursor: SheetMoveCursor) => void;
	/** 행 이동 시 다중 선택 확장 / 앵커 이동 */
	handleRowMoved: (row: number, withShift: boolean) => void;
	/** Space: 다중 선택 중 현재 행 토글 (다중 밖 no-op) */
	handleSpaceToggle: (row: number) => void;
	handleInsertAtFocus: () => void;
	handleRemoveAtFocus: () => void;
	handleToggleMultipleClick: () => void;
}

export interface UseSheetWindowParams {
	rows: readonly RowHeightInfo[];
	/** 탭 전환 시 복원할 scrollTop */
	restoreScrollTop?: number;
	/** 복원 트리거 키 — 보통 activeTabIndex */
	restoreKey?: number;
	onScrollTopChange?: (scrollTop: number) => void;
}

export interface UseSheetTabRenameParams {
	tabs: SheetTabView[];
	onRenameTab?: (index: number, name: string) => boolean;
}

export interface UseSheetTabRenameResult {
	renamingIndex: number | null;
	draftName: string;
	isDraftInvalid: boolean;
	renameInputRef: RefObject<HTMLInputElement | null>;
	renameInputSize: number;
	handleBeginRename: (index: number) => void;
	handleDraftChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
	handleDraftKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>, index: number) => void;
	handleDraftBlur: (event: FocusEvent<HTMLInputElement>, index: number) => void;
	isRenaming: boolean;
}

/** applyFocus 옵션 — 스크롤 위치 지정 */
export interface ApplyFocusOptions {
	scrollTop?: number | null;
}

/** DOM/추정 공통 셀 좌표 — SheetCellEditTarget의 위치 부분 */
export interface SheetCellRect {
	left: number;
	top: number;
	minWidth: number;
	minHeight: number;
}

export interface SheetCellEditTarget extends SheetCellRect {
	rowIndex: number;
	column: SheetColumnId;
	value: string;
}

/** applyFocus 스크롤 계산 입력 — body 실측값 */
export interface FocusBodyMetrics {
	scrollTop: number;
	scrollLeft: number;
	clientHeight: number;
	clientWidth: number;
}

/** applyFocus 스크롤 계산 결과 */
export interface FocusScrollResult {
	target: SheetCellEditTarget;
	rowScroll: number | null;
	scrollLeft: number | null;
}

export interface UseSheetCellEditParams {
	format: SheetFormat;
	rows: SheetRowView[];
	scrollRef: RefObject<HTMLDivElement | null>;
	scrollContentRef: RefObject<HTMLDivElement | null>;
	setScrollTop: (scrollTop: number) => void;
	onCommitCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

export interface UseSheetCellEditResult {
	mode: SheetCellEditorMode;
	target: SheetCellEditTarget | null;
	inputRef: RefObject<HTMLDivElement | null>;
	wrapRef: RefObject<HTMLDivElement | null>;
	currentRowIndex: number | null;
	currentColumn: SheetColumnId | null;
	/** shortkey용 — `mode === 'edit'` 동기 판별 */
	isEditing: () => boolean;
	/** shortkey용 — text/memo 타깃 */
	isTextTarget: () => boolean;
	/** shortkey용 — starttime/endtime 타깃 */
	isTimeTarget: () => boolean;
	/** shortkey용 — 셀 포커스(hidden 아님) */
	hasFocus: () => boolean;
	/** 편집 중이면 커밋 후 focus 유지 가능 */
	endEdit: (commit?: boolean) => void;
	/** F2 / Enter(비에딧) */
	beginEdit: () => void;
	/** Esc */
	cancelEdit: () => void;
	/** printable / IME → edit (지연 setMode) */
	beginEditFromTyping: ShortcutKeyHandler;
	/** Enter(에딧 중) 줄바꿈 */
	insertEditorLineBreak: () => void;
	/** 포커스 이동 (스크롤 포함) */
	applyFocus: (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => void;
	handleCellClick: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	handleCellDoubleClick: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	handleCellContextMenu: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	handleInputKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
	handleInputClick: (event: MouseEvent<HTMLDivElement>) => void;
	handleEditorBlur: () => void;
}

/**
 * 편집 진입 probe — React KeyboardEvent와 window KeyboardEvent의 공통 부분집합.
 * 두 이벤트 타입을 한 함수로 처리하기 위한 최소 계약.
 */
export interface SheetEditKeyProbe {
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	key: string;
	code: string;
	preventDefault?: () => void;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean; keyCode?: number };
	keyCode?: number;
}

/** 포커스/스크롤 hook — 셀 포커스와 스크롤 이동만 담당 */
export interface UseSheetCellFocusParams {
	format: SheetFormat;
	rows: SheetRowView[];
	scrollRef: RefObject<HTMLDivElement | null>;
	scrollContentRef: RefObject<HTMLDivElement | null>;
	setScrollTop: (scrollTop: number) => void;
}

export interface UseSheetCellFocusResult {
	mode: SheetCellEditorMode;
	target: SheetCellEditTarget | null;
	inputRef: RefObject<HTMLDivElement | null>;
	wrapRef: RefObject<HTMLDivElement | null>;
	modeRef: RefObject<SheetCellEditorMode>;
	targetRef: RefObject<SheetCellEditTarget | null>;
	rowsRef: RefObject<SheetRowView[]>;
	setMode: (mode: SheetCellEditorMode) => void;
	setTarget: (target: SheetCellEditTarget | null) => void;
	/** data-row/data-column 셀 요소 조회 */
	findCellElement: (rowIndex: number, column: SheetColumnId) => HTMLElement | null;
	/** scrollContentRef 기저 좌표 추정 (미측정) */
	resolveEstimatedTarget: (rowIndex: number, column: SheetColumnId) => SheetCellEditTarget | null;
	/** getBoundingClientRect 실측 좌표 */
	resolveMeasuredTarget: (
		rowIndex: number,
		column: SheetColumnId,
		cell: HTMLElement,
	) => SheetCellEditTarget | null;
	/** wrap이 포커스를 잃었을 때 편집 중 wrap으로 복귀 */
	focusWrapIfNeeded: () => void;
	/** text/memo는 input(IME), 그 외는 wrap으로 포커스 */
	focusSelectionTarget: (column?: SheetColumnId) => void;
	/** 셀 포커스 + 스크롤 + target 이동 */
	focusTarget: (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => void;
	/** 포커스 이동 (스크롤 포함) */
	applyFocus: (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => void;
}

/** 편집 모드 ref 쌍 — 순수 판별(edit-mode) 입력 */
export interface EditModeDeps {
	modeRef: RefObject<SheetCellEditorMode>;
	targetRef: RefObject<SheetCellEditTarget | null>;
}

/** mode/target → contenteditable innerHTML 동기화 hook params */
export interface UseEditInputSyncParams {
	mode: SheetCellEditorMode;
	target: SheetCellEditTarget | null;
	inputRef: RefObject<HTMLDivElement | null>;
	modeRef: RefObject<SheetCellEditorMode>;
}

/** 편집 라이프사이클 hook — 편집 진입/커밋/취소 및 키 입력 진입 담당 */
export interface UseSheetCellEditorParams {
	format: SheetFormat;
	focus: UseSheetCellFocusResult;
	onCommitCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

export interface UseSheetCellEditorResult {
	mode: SheetCellEditorMode;
	target: SheetCellEditTarget | null;
	inputRef: RefObject<HTMLDivElement | null>;
	wrapRef: RefObject<HTMLDivElement | null>;
	beginEdit: (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => void;
	/** F2 / Enter(비에딧) — 현재 포커스 셀 */
	beginEditOnCurrent: () => void;
	/** printable / IME → edit (shortkey) */
	beginEditFromTyping: ShortcutKeyHandler;
	isEditing: () => boolean;
	isTextTarget: () => boolean;
	isTimeTarget: () => boolean;
	hasFocus: () => boolean;
	commitEdit: (keepFocus?: boolean) => void;
	cancelEdit: () => void;
	endEdit: (commit?: boolean) => void;
	insertEditorLineBreak: () => void;
	handleInputKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
	handleInputClick: (event: MouseEvent<HTMLDivElement>) => void;
	handleEditorBlur: () => void;
}

/** shortkey에 주입할 시트 동작 API 조립 params */
export interface BuildSheetShortkeyActionsParams {
	move: SheetShortkeyMoveActions;
	isEditing: () => boolean;
	isTextTarget: () => boolean;
	hasFocus: () => boolean;
	isMultiple: () => boolean;
	beginEdit: () => void;
	cancelEdit: () => void;
	beginEditFromTyping: SheetShortkeyActions['beginEditFromTyping'];
	insertEditorLineBreak: () => void;
	toggleMultiple: () => void;
	toggleRowSelect: () => void;
	insertRow: () => void;
	removeRow: () => void;
	applyTextFormat: (command: SheetTextFormatCommand) => void;
	clearCell: () => void;
	clipCut: () => void;
	clipCopy: () => void;
	clipPaste: () => void;
	isTimeTarget: () => boolean;
	timePlus: () => void;
	timeMinus: () => void;
	toggleSearch: () => void;
}

/** clip 훅 params — 포커스 셀·편집 판별·에디터 ref·커밋 */
export interface UseSheetClipActionsParams {
	currentRowIndex: number | null;
	currentColumn: SheetColumnId | null;
	isEditing: () => boolean;
	isTextTarget: () => boolean;
	inputRef: RefObject<HTMLDivElement | null>;
	onUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
	/** 서식·clear·클립 직전 검색 패널 닫기 */
	closeSearchPanel: () => void;
}

/** clip 훅 결과 — shortkey actions에 주입할 clip API */
export interface UseSheetClipActionsResult {
	applyTextFormat: (command: SheetTextFormatCommand) => void;
	clearCell: () => void;
	clipCut: () => void;
	clipCopy: () => void;
	clipPaste: () => void;
}

/** time 훅 params — 포커스 time 셀·다중 선택·time 타깃 판별 */
export interface UseSheetTimeActionsParams {
	currentRowIndex: number | null;
	currentColumn: SheetColumnId | null;
	isTimeTarget: () => boolean;
	/** ±jump 직전 검색 패널 닫기 */
	closeSearchPanel: () => void;
}

/** time 훅 결과 — shortkey actions에 주입할 time ±jump API */
export interface UseSheetTimeActionsResult {
	timePlus: () => void;
	timeMinus: () => void;
}

/** 검색 훅 params — 포커스·에딧·점프 API (feature 스토어는 훅 내부에서 직접 사용) */
export interface UseSheetSearchActionsParams {
	format: SheetFormat;
	rows: SheetRowView[];
	/** shortkey용 — `mode === 'edit'` 동기 판별 */
	isEditing: () => boolean;
	endEdit: (commit?: boolean) => void;
	applyFocus: (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => void;
}

/** 검색 훅 결과 — 패널 점프·패널 close·히트 셀 키 */
export interface UseSheetSearchActionsResult {
	/** 검색 히트 셀 키 `"row:columnId"` (editable col 변환 후) */
	searchHitKeys: ReadonlySet<string>;
	/** 히트 셀로 점프 — 에딧 커밋 후 포커스 */
	handleSearchJump: (hit: SearchHit) => void;
	/** mutate·에딧 진입 직전 패널 닫기 */
	closeSearchPanel: () => void;
	/** `/` — 검색 패널 토글 */
	toggleSearch: () => void;
}
