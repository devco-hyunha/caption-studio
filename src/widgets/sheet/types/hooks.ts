import type {
	ChangeEvent,
	FocusEvent,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent,
	RefObject,
} from 'react';
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

export interface UseSheetMoveParams {
	format: SheetFormat;
	rows: SheetRowView[];
	mode: SheetCellEditorMode;
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
	/** Space: 다중 선택 중 현재 행 토글 */
	onSpaceToggle?: (row: number) => void;
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

export interface SheetCellEditTarget {
	rowIndex: number;
	column: SheetColumnId;
	left: number;
	top: number;
	minWidth: number;
	minHeight: number;
	value: string;
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
	/** 편집 중이면 커밋 후 focus 유지 가능 */
	endEdit: (commit?: boolean) => void;
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
	/** 문자 키 입력으로 빈 에디터 진입 (IME-safe) */
	activateEditFromTyping: (isIme: boolean) => void;
	beginEdit: (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => void;
	commitEdit: (keepFocus?: boolean) => void;
	cancelEdit: () => void;
	endEdit: (commit?: boolean) => void;
	/** 키 입력으로 편집 시작 시도 — 소비 여부 반환 */
	tryBeginEditFromKey: (event: SheetEditKeyProbe) => boolean;
	handleInputKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
	handleInputClick: (event: MouseEvent<HTMLDivElement>) => void;
	handleEditorBlur: () => void;
}
