import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type {
  ApplyFocusOptions,
  SheetCellEditTarget,
  SheetCellEditorMode,
  SheetRowView,
} from '../primitives';

/** 포커스/스크롤 hook — 셀 포커스와 스크롤 이동만 담당 */
export interface UseSheetCellFocusParams {
  format: SubtitleFormat;
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
  focusWrapIfNeeded: Fn<void>;
  /** text/memo는 input(IME), 그 외는 wrap으로 포커스 */
  focusSelectionTarget: (column?: SheetColumnId) => void;
  /** 셀 포커스 + 스크롤 + target 이동 */
  focusTarget: (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => void;
  /** 포커스 이동 (스크롤 포함) */
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
}

/** pending focus 훅 params — 렌더 반영 후 포커스 적용 (selection·undo 공유) */
export interface UsePendingFocusParams {
  format: SubtitleFormat;
  rows: SheetRowView[];
  /** 시트 총 높이 — pending focus 대기 조건 */
  totalHeight: number;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
}
