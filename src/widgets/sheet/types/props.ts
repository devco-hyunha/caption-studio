import type {
	CSSProperties,
	ChangeEvent,
	FocusEvent,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent,
	ReactNode,
	RefObject,
} from 'react';
import type { SheetColumnId, SheetFormat, SheetRowView } from './primitives';

export interface SheetTabView {
	name: string;
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

/** 우클릭 탭 메뉴 — 커서 좌표 앵커 */
export interface SheetTabMenuState {
	index: number;
	x: number;
	y: number;
}

/** 시트 상단 툴바 — 다중 선택 토글, 포커스 행 추가/삭제 */
export interface SheetBodyToolbarProps {
	multipleActive: boolean;
	onToggleMultiple: () => void;
	onInsertRow: () => void;
	onRemoveRow: () => void;
	className?: string;
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
	onDraftKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>, index: number) => void;
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
	onInputKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
	onInputClick?: (event: MouseEvent<HTMLDivElement>) => void;
	onInputBlur?: () => void;
}
