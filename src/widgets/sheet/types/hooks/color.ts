import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColorCommand } from '@/shared/types/color-command';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';

/** color wiring 훅 params — 시트 clip 훅과 동일 shape (format은 focus 커서 파생에만 사용) */
export interface UseSheetColorWiringParams {
  format: SubtitleFormat;
  currentRowIndex: number | null;
  currentColumn: SheetColumnId | null;
  isEditing: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  inputRef: RefObject<HTMLDivElement | null>;
  onUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
  closeSearchPanel: Fn<void>;
}

/** color wiring 훅 결과 — shortkey actions에 주입할 color API */
export interface UseSheetColorWiringResult {
  applyColor: (command: SheetColorCommand) => void;
}
