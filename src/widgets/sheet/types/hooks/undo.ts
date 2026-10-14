import type { Fn } from '@/shared/types/fn';
import type { ApplyFocusOptions, SheetColumnId, SheetFormat, SheetRowView } from '../primitives';

/** undo/redo 훅 params — 포커스·에딧 판별 */
export interface UseSheetUndoActionsParams {
  format: SheetFormat;
  rows: SheetRowView[];
  totalHeight: number;
  isEditing: Fn<boolean>;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
}

export interface UseSheetUndoActionsResult {
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: Fn<void>;
  handleRedo: Fn<void>;
}
