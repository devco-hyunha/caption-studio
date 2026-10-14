import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '../primitives';

/** video shortkey 훅 params — 포커스·편집·포커스 적용 */
export interface UseSheetVideoActionsParams {
  isEditing: Fn<boolean>;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  endEdit: (commit?: boolean) => void;
  applyFocus: (rowIndex: number, column: SheetColumnId) => void;
}

/** video shortkey 훅 결과 — shortkey actions에 주입할 video API */
export interface UseSheetVideoActionsResult {
  videoJump: Fn<void>;
  sheetJump: Fn<void>;
  videoPlayToggle: Fn<void>;
  videoSeekPrev: Fn<void>;
  videoSeekNext: Fn<void>;
  volumeUp: Fn<void>;
  volumeDown: Fn<void>;
  cuePrev: Fn<void>;
  cueNext: Fn<void>;
}
