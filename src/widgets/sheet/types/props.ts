import type {
  CSSProperties,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  UIEvent,
} from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SheetCursor } from '@/shared/types/sheet-cursor';
import type { SmiMeta } from '@/shared/types/smi-meta';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { ErrorRowLike } from '@/features/sheet-search';
import type { ExportWorkbookTab } from '@/features/subtitle-io';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { SheetCellEditorMode, SheetCellRect, SheetRowView, SheetTabView } from './primitives';

export interface SheetPanelProps {
  format: SubtitleFormat;
  rows: SheetRowView[];
  estimateRowHeight?: number;
  /** 시트 탭 (미지정 시 sheet1 단일 탭) */
  tabs?: SheetTabView[];
  activeTabIndex?: number;
  /** 활성 탭 복원용 scrollTop */
  scrollTop?: number;
  onScrollTopChange?: (scrollTop: number) => void;
  onSelectTab?: (index: number) => void;
  onAddTab?: Fn<void>;
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

/** sheet-body scroll 셸 — refs·scroll 이벤트·children을 받는 presentational 래퍼 */
export interface SheetScrollContainerProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  children: ReactNode;
  className?: string;
}

/** sheet-body 행 렌더 셸 — 윈도 indices·행 높이·재생 highlight·검색 히트·셀 이벤트 소비 */
export interface SheetBodyRowsProps {
  format: SubtitleFormat;
  rows: SheetRowView[];
  /** 윈도 포함 행 index (inclusive start ~ exclusive end) */
  indices: number[];
  /** 시트 총 높이 — `--sheet-panel-height` */
  totalHeight: number;
  /** 윈도 paddingTop — `--sheet-window-padding-top` */
  paddingTop: number;
  /** 1줄 기준 행 높이 fallback */
  estimateRowHeight: number;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  /** 검색 히트 셀 키 `"row:columnId"` */
  searchHitKeys: ReadonlySet<string>;
  /** 셀 이벤트 번들 */
  cellEvents: SheetCellEvents;
  /** 재생 시각 활성 행 index 집합 */
  playbackSet: ReadonlySet<number>;
}

/** 시트 상단 툴바 — 다중 선택·행 CRUD·undo/redo. timelines·workbookTabs는 툴바 내부 생성 */
/** toolbar 소비 필드 번들 — composite action 결과 중 toolbar가 쓰는 부분만 (ISP) */
export interface SheetBodyToolbarActions {
  multipleActive: boolean;
  handleToggleMultipleClick: Fn<void>;
  handleInsertAtFocus: Fn<void>;
  handleRemoveAtFocus: Fn<void>;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: Fn<void>;
  handleRedo: Fn<void>;
  /** 검색 히트 점프 — sheet-body search 훅 */
  handleSearchJump: (hit: SheetCursor) => void;
}

export interface SheetBodyToolbarProps {
  format: SubtitleFormat;
  rows: SheetRowView[];
  /** toolbar 소비 필드 번들 — composite action 결과 */
  actions: SheetBodyToolbarActions;
  /** import — 활성 탭 timelines 교체 (sheet-body 소유) */
  onImported: (timelines: SheetTimelineItem[]) => void;
  className?: string;
}

/** toolbar 버튼 섹션 — 다중 선택·행 CRUD·undo/redo (번들 소비) */
export interface SheetToolbarButtonsProps {
  actions: SheetBodyToolbarActions;
}

/** toolbar 검색 섹션 — timelines는 툴바 생성, 점프는 body 콜백 */
export interface SheetToolbarSearchProps {
  format: SubtitleFormat;
  timelines: readonly SheetTimelineItem[];
  rows: readonly ErrorRowLike[];
  onJump: (hit: SheetCursor) => void;
}

/** toolbar I/O 섹션 — timelines·workbookTabs는 툴바 생성, import·SMI meta는 시트 스토어 반영 */
export interface SheetToolbarIoProps {
  sheetFormat: SubtitleFormat;
  timelines: readonly SheetTimelineItem[];
  /** json/excel·시트 피커 — 자막 탭 전체 (SMI 메타 포함) */
  workbookTabs: readonly ExportWorkbookTab[];
  activeIndex: number;
  onImported: (timelines: SheetTimelineItem[]) => void;
  onSmiMetaChange: (index: number, meta: SmiMeta) => void;
}

export interface SheetFooterProps {
  tabs: SheetTabView[];
  activeIndex: number;
  className?: string;
  onSelectTab?: (index: number) => void;
  onAddTab?: Fn<void>;
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
  onOpenChange: (open: boolean) => void;
  onRename: (index: number) => void;
  onCopy: (index: number) => void;
  onDelete: (index: number) => void;
}

export interface SheetHeaderProps {
  format: SubtitleFormat;
  className?: string;
}

export interface SheetHeaderCellProps {
  id: SheetColumnId;
  format: SubtitleFormat;
}

export interface SheetBodyProps {
  format: SubtitleFormat;
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
  /** 툴바·검색 패널 — sheet-head 위 슬롯에 portal */
  chromePortalEl?: HTMLElement | null;
}

/** 셀 이벤트 번들 — SheetRow·SheetCell이 (event, rowIndex, column)로 호출 */
export interface SheetCellEvents {
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

/** 에디터 input 이벤트 번들 — SheetCellEditor가 (event)/()로 호출 */
export interface SheetInputEvents {
  onInputKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  onInputClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onInputBlur?: Fn<void>;
}

export interface SheetRowProps {
  format: SubtitleFormat;
  row: SheetRowView;
  style?: CSSProperties;
  'data-index'?: number;
  currentColumn?: SheetColumnId | null;
  /** 검색 히트 셀 — `"row:columnId"` 키 */
  searchHitKeys?: ReadonlySet<string>;
  /** 셀 이벤트 번들 */
  cellEvents?: SheetCellEvents;
}

export interface SheetCellProps {
  column: SheetColumnId;
  rowIndex?: number;
  children?: ReactNode;
  /** text/memo 등 자막 서식 HTML (원본 보존 렌더) */
  html?: string;
  editable?: boolean;
  isCurrent?: boolean;
  /** 검색 히트 셀 배경 — `#ffff95` */
  isSearchHit?: boolean;
  className?: string;
  tabIndex?: number;
  /** 셀 이벤트 번들 */
  cellEvents?: SheetCellEvents;
}

export interface SheetCellEditorProps {
  mode?: SheetCellEditorMode;
  /** 셀 좌표·min 크기 번들 */
  rect?: SheetCellRect | null;
  /** time 다중 클립 */
  isMultiClip?: boolean;
  className?: string;
  wrapRef?: RefObject<HTMLDivElement | null>;
  inputRef?: RefObject<HTMLDivElement | null>;
  /** input 이벤트 번들 */
  inputEvents?: SheetInputEvents;
}
