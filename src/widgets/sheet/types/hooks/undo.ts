import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { ApplyFocusOptions, SheetRowView } from '../primitives';

/** undo/redo 훅 params — 포커스·에딧 판별 */
export interface UseSheetUndoActionsParams {
  format: SubtitleFormat;
  rows: SheetRowView[];
  totalHeight: number;
  isEditing: Fn<boolean>;
  applyFocus: (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => void;
  closeSearchPanel: Fn<void>;
}

export interface UseSheetUndoActionsResult {
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: Fn<void>;
  handleRedo: Fn<void>;
}
