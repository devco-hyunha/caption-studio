import type { SheetCellEditTarget, SheetColumnId, SheetFormat, SheetRowView } from '../../types';
import { COLUMN_WIDTHS, getColumnLeft } from '../columns';
import { getCellValue } from '../get-cell-value';
import { getRowTop } from '../move/sheet-move';

const measureCellPosition = (
	cell: HTMLElement,
	scrollContent: HTMLElement,
): { left: number; top: number; minWidth: number; minHeight: number } => {
	const cellRect = cell.getBoundingClientRect();
	const contentRect = scrollContent.getBoundingClientRect();

	return {
		left: cellRect.left - contentRect.left,
		top: cellRect.top - contentRect.top,
		minWidth: cell.offsetWidth,
		minHeight: cell.offsetHeight,
	};
};

/** DOM 없이 행 누적 높이·열 left로 즉시 좌표 산출 (키 반복 동기화) */
const resolveTargetByIndex = (
	rows: readonly SheetRowView[],
	format: SheetFormat,
	rowIndex: number,
	column: SheetColumnId,
): SheetCellEditTarget | null => {
	const row = rows[rowIndex];
	if (!row) return null;

	return {
		rowIndex,
		column,
		left: getColumnLeft(format, column),
		top: getRowTop(rows, rowIndex),
		minWidth: COLUMN_WIDTHS[column],
		minHeight: row.height,
		value: getCellValue(row, column),
	} satisfies SheetCellEditTarget;
};

/** DOM 실측 좌표로 타깃 산출. 실측값이 0이면 열 너비·행 높이로 보정 */
const resolveTarget = (
	rows: readonly SheetRowView[],
	format: SheetFormat,
	rowIndex: number,
	column: SheetColumnId,
	cell: HTMLElement,
	scrollContent: HTMLElement,
): SheetCellEditTarget | null => {
	const row = rows[rowIndex];
	if (!row) return null;

	const measured = measureCellPosition(cell, scrollContent);
	return {
		rowIndex,
		column,
		left: measured.left,
		top: measured.top,
		minWidth: measured.minWidth || COLUMN_WIDTHS[column],
		minHeight: measured.minHeight || row.height,
		value: getCellValue(row, column),
	} satisfies SheetCellEditTarget;
};

export { measureCellPosition, resolveTarget, resolveTargetByIndex };
