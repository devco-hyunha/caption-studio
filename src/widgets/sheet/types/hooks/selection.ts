import type { Fn } from '@/shared/types/fn';
import type {
  ApplyFocusOptions,
  SheetColumnId,
  SheetFormat,
  SheetMoveCursor,
  SheetRowView,
} from '../primitives';

/** 다중 선택·행 CRUD action params */
export interface UseSheetSelectionActionsParams {
  format: SheetFormat;
  rows: SheetRowView[];
  /** 시트 총 높이 — pending focus 대기 조건 */
  totalHeight: number;
  /** 편집 중 여부 — undo 훅과 동일 방식(ref 기반 판별) */
  isEditing: Fn<boolean>;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  endEdit: (commit?: boolean) => void;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
  /** 행 CRUD 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
}

export interface UseSheetSelectionActionsResult {
  multipleActive: boolean;
  /** Tab append: 커서 행 아래 삽입 */
  handleAppendRow: (cursor: SheetMoveCursor) => void;
  /** 행 이동 시 다중 선택 확장 / 앵커 이동 */
  handleRowMoved: (row: number, withShift: boolean) => void;
  /** Space: 다중 선택 중 현재 행 토글 (다중 밖 no-op) */
  handleSpaceToggle: (row: number) => void;
  handleInsertAtFocus: Fn<void>;
  handleRemoveAtFocus: Fn<void>;
  handleToggleMultipleClick: Fn<void>;
}
