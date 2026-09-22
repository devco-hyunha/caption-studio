import type {
	ChangeEvent,
	CSSProperties,
	FocusEvent,
	KeyboardEvent,
	MouseEvent,
	ReactNode,
	RefObject,
} from 'react';

export type SheetFormat = 'smi' | 'srt';

export type SheetColumnId =
	| 'index'
	| 'starttime'
	| 'endtime'
	| 'dur'
	| 'text'
	| 'memo';

export interface SheetTimelineRow {
	id: string;
	start: number;
	end: number;
	text: string;
	memo: string;
}

export interface SheetRowView {
	index: number;
	starttime: string;
	endtime: string;
	dur: string;
	text: string;
	memo: string;
	/** convert.js rowInfo.height와 동일 기준(사전 계산) */
	height: number;
	isError?: boolean;
	isSelected?: boolean;
}

export interface SheetColumnDef {
	id: SheetColumnId;
	label: string;
	editable: boolean;
}

export interface SheetPanelProps {
	format: SheetFormat;
	rows: SheetRowView[];
	estimateRowHeight?: number;
	/** 시트 탭 (미지정 시 sheet1 단일 탭) */
	tabs?: SheetTabView[];
	activeTabIndex?: number;
	/** 활성 탭 복원용 scrollTop */
	scrollTop?: number;
	onScrollTopChange?: (scrollTop: number) => void;
	onSelectTab?: (index: number) => void;
	onAddTab?: () => void;
	onDeleteTab?: (index: number) => void;
	onRenameTab?: (index: number, name: string) => boolean;
	onCopyTab?: (index: number) => void;
	onUpdateCell?: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
	className?: string;
	'aria-label'?: string;
}

export interface SheetTabView {
	name: string;
}

/** 우클릭 탭 메뉴 — 커서 좌표 앵커 */
export interface SheetTabMenuState {
	index: number;
	x: number;
	y: number;
}

export interface SheetFooterProps {
	tabs: SheetTabView[];
	activeIndex: number;
	className?: string;
	onSelectTab?: (index: number) => void;
	onAddTab?: () => void;
	onDeleteTab?: (index: number) => void;
	onRenameTab?: (index: number, name: string) => boolean;
	onCopyTab?: (index: number) => void;
}

export interface SheetTabProps {
	name: string;
	index: number;
	isActive: boolean;
	isRenaming: boolean;
	draftName: string;
	isDraftInvalid: boolean;
	renameInputSize: number;
	renameInputRef: RefObject<HTMLInputElement | null>;
	onSelect: (index: number) => void;
	onContextMenu: (event: MouseEvent<HTMLButtonElement>, index: number) => void;
	onDraftChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
	onDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>, index: number) => void;
	onDraftBlur: (event: FocusEvent<HTMLInputElement>, index: number) => void;
}

export interface SheetTabMenuProps {
	menu: SheetTabMenuState | null;
	tabName: string | null;
	canDelete: boolean;
	onOpenChange: (open: boolean) => void;
	onRename: (index: number) => void;
	onCopy: (index: number) => void;
	onDelete: (index: number) => void;
}

export interface SheetHeaderProps {
	format: SheetFormat;
	className?: string;
}

export interface SheetBodyProps {
	format: SheetFormat;
	rows: SheetRowView[];
	estimateRowHeight: number;
	className?: string;
	/** 탭 전환 복원용 scrollTop */
	scrollTop?: number;
	/** 복원 트리거 (activeTabIndex) */
	scrollRestoreKey?: number;
	onScrollTopChange?: (scrollTop: number) => void;
	/** body 가로 스크롤 → header translateX 동기화 */
	onHorizontalScroll?: (scrollLeft: number) => void;
	onUpdateCell?: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

export interface SheetRowProps {
	format: SheetFormat;
	row: SheetRowView;
	style?: CSSProperties;
	'data-index'?: number;
	currentColumn?: SheetColumnId | null;
	onCellClick?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	onCellDoubleClick?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	onCellContextMenu?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
}

export interface SheetCellProps {
	column: SheetColumnId;
	rowIndex?: number;
	children?: ReactNode;
	/** text/memo 등 자막 서식 HTML (원본 보존 렌더) */
	html?: string;
	editable?: boolean;
	isCurrent?: boolean;
	className?: string;
	tabIndex?: number;
	onCellClick?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	onCellDoubleClick?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
	onCellContextMenu?: (
		event: MouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => void;
}

/** 셀 에디터 — 비활성 / 포커스(선택) / 편집 */
export type SheetCellEditorMode = 'hidden' | 'focus' | 'edit';

export interface SheetCellEditorProps {
	mode?: SheetCellEditorMode;
	left?: number;
	top?: number;
	minWidth?: number;
	minHeight?: number;
	/** time 다중 클립 */
	isMultiClip?: boolean;
	className?: string;
	wrapRef?: RefObject<HTMLDivElement | null>;
	inputRef?: RefObject<HTMLDivElement | null>;
	onInputKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
	onInputClick?: (event: MouseEvent<HTMLDivElement>) => void;
	onInputBlur?: () => void;
}

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
	handleDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>, index: number) => void;
	handleDraftBlur: (event: FocusEvent<HTMLInputElement>, index: number) => void;
	isRenaming: boolean;
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
	handleInputKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
	handleInputClick: (event: MouseEvent<HTMLDivElement>) => void;
	handleEditorBlur: () => void;
}

export interface RowHeightInfo {
	height: number;
}

export interface SheetStartRow {
	/** 행 시작 Y (해당 행 높이 누적 전) */
	offset: number;
	height: number;
	index: number;
}

export interface SheetMoveCursor {
	row: number;
	/** editable 열 인덱스 (`EDITABLE_COLUMNS[format]`) */
	col: number;
}

export interface SheetPageViewBox {
	viewTop: number;
	viewHeight: number;
}

export interface SheetPageMoveResult {
	row: number;
	scrollTop: number | null;
}

export interface SheetScrollIntoViewResult {
	scrollTop: number | null;
}

export interface SheetColScrollIntoViewResult {
	scrollLeft: number | null;
}

export interface SheetWindowResult {
	/** viewport 높이 기준 page (floor(scrollTop / viewportHeight)) */
	pageIndex: number;
	startIndex: number;
	endIndex: number;
	paddingTop: number;
	totalHeight: number;
	/** 윈도에 포함할 행 index (inclusive start ~ exclusive end) */
	indices: number[];
}
