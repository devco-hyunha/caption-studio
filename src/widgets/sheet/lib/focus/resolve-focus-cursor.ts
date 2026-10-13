import { getEditableColIndex } from '../move/sheet-move';
import type { SheetColumnId, SheetFormat } from '../../types';

/** 포커스 셀 → history cursor (editable col index). 열 판별 없으면 첫 열 */
const resolveFocusCursor = (
  format: SheetFormat,
  currentRowIndex: number | null,
  currentColumn: SheetColumnId | null,
): { row: number; col: number } => {
  const row = currentRowIndex ?? 0;
  const col = currentColumn == null ? 0 : Math.max(0, getEditableColIndex(format, currentColumn));
  return { row, col };
};

export { resolveFocusCursor };
