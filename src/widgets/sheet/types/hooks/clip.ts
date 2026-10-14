import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SheetTextFormatCommand } from '@/features/shortkey';

/** clip 훅 params — 포커스 셀·편집 판별·에디터 ref·커밋 */
export interface UseSheetClipActionsParams {
  format: SubtitleFormat;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  isEditing: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  inputRef: RefObject<HTMLDivElement | null>;
  onUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
  /** 서식·clear·클립 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
}

/** clip 훅 결과 — shortkey actions에 주입할 clip API */
export interface UseSheetClipActionsResult {
  applyTextFormat: (command: SheetTextFormatCommand) => void;
  clearCell: Fn<void>;
  clipCut: Fn<void>;
  clipCopy: Fn<void>;
  clipPaste: Fn<void>;
}
