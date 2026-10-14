import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { ShortcutKeyHandler } from '@/features/shortkey';
import type {
  ApplyFocusOptions,
  SheetCellEditTarget,
  SheetCellEditorMode,
  SheetColumnId,
  SheetFormat,
  SheetRowView,
} from '../primitives';
import type { SheetCellEvents, SheetInputEvents } from '../props';
import type { UseSheetCellFocusResult } from './focus';

export interface UseSheetCellEditParams {
  format: SheetFormat;
  rows: SheetRowView[];
  scrollRef: RefObject<HTMLDivElement | null>;
  scrollContentRef: RefObject<HTMLDivElement | null>;
  setScrollTop: (scrollTop: number) => void;
  onCommitCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
  /** 에딧 진입 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
  /** 검색 input 포커스 중 — 에딧 진입 차단 */
  isSearchInputFocused: Fn<boolean>;
}

/**
 * 편집 상태·판별·종료 API — focus·editor·composite가 공유하는 필드.
 * 시그니처가 다른 `beginEdit`·UI 핸들러는 각 Result에서 별도로 선언한다.
 */
interface EditResultShared {
  mode: SheetCellEditorMode;
  target: SheetCellEditTarget | null;
  inputRef: RefObject<HTMLDivElement | null>;
  wrapRef: RefObject<HTMLDivElement | null>;
  /** shortkey용 — `mode === 'edit'` 동기 판별 */
  isEditing: Fn<boolean>;
  /** shortkey용 — text/memo 타깃 */
  isTextTarget: Fn<boolean>;
  /** shortkey용 — starttime/endtime 타깃 */
  isTimeTarget: Fn<boolean>;
  /** shortkey용 — 셀 포커스(hidden 아님) */
  hasFocus: Fn<boolean>;
  /** 편집 중이면 커밋 후 focus 유지 가능 */
  endEdit: (commit?: boolean) => void;
  /** Esc */
  cancelEdit: Fn<void>;
  /** printable / IME → edit (지연 setMode) */
  beginEditFromTyping: ShortcutKeyHandler;
  /** Enter(에딧 중) 줄바꿈 */
  insertEditorLineBreak: Fn<void>;
}

export interface UseSheetCellEditResult extends EditResultShared {
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  /** F2 / Enter(비에딧) — 현재 포커스 셀 */
  beginEdit: Fn<void>;
  /** 포커스 이동 (스크롤 포함) */
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
  /** 셀 이벤트 번들 — SheetRow·SheetCell 소비 */
  cellEvents: SheetCellEvents;
  /** input 이벤트 번들 — SheetCellEditor 소비 */
  inputEvents: SheetInputEvents;
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
  /** 에딧 진입 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
  /** 검색 input 포커스 중 — 에딧 진입 차단 */
  isSearchInputFocused: Fn<boolean>;
}

export interface UseSheetCellEditorResult extends EditResultShared {
  beginEdit: (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => void;
  /** F2 / Enter(비에딧) — 현재 포커스 셀 */
  beginEditOnCurrent: Fn<void>;
  commitEdit: (keepFocus?: boolean) => void;
  handleInputKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  handleInputClick: (event: MouseEvent<HTMLDivElement>) => void;
  handleEditorBlur: Fn<void>;
}
