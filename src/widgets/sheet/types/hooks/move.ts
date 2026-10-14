import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { ShortcutKeyHandler } from '@/features/shortkey';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SheetCursor } from '@/shared/types/sheet-cursor';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { ApplyFocusOptions, RowHeightInfo, SheetRowView } from '../primitives';

/** 이동 계산 결과 — applyFocus 대상 커서 + 선택적 스크롤 */
export interface MoveTarget {
  cursor: SheetCursor;
  scrollTop?: number | null;
}

export type MoveCalc = (cursor: SheetCursor) => MoveTarget | 'append' | null;

export interface UseSheetMoveParams {
  format: SubtitleFormat;
  rows: SheetRowView[];
  /** shortkey용 — `mode === 'edit'` 동기 판별 */
  isEditing: Fn<boolean>;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  scrollRef: RefObject<HTMLDivElement | null>;
  endEdit: (commit?: boolean) => void;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
  /** Tab으로 마지막 행 아래 이동 시 행 추가 */
  onAppendRow?: (cursor: SheetCursor) => void;
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

export interface UseSheetWindowParams {
  rows: readonly RowHeightInfo[];
  /** 탭 전환 시 복원할 scrollTop */
  restoreScrollTop?: number;
  /** 복원 트리거 키 — 보통 activeTabIndex */
  restoreKey?: number;
  onScrollTopChange?: (scrollTop: number) => void;
}
