import type { SheetColumnId, SheetRowView } from '../types';

/** `SheetRowView` → 표시/편집용 셀 문자열 */
const getCellValue = (row: SheetRowView, column: SheetColumnId): string => {
	if (column === 'index') return String(row.index + 1);
	if (column === 'starttime') return row.starttime;
	if (column === 'endtime') return row.endtime;
	if (column === 'dur') return row.dur;
	if (column === 'text') return row.text;
	return row.memo;
};

export { getCellValue };
