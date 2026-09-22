import type { SheetColumnDef, SheetColumnId, SheetFormat } from '../types';

/** `columns.js` COLUMN_WIDTH_RATE: width = ceil(fontSize * rate) */
const COLUMN_WIDTH_RATE = {
	index: 3.5625,
	starttime: 7.1875,
	endtime: 7.1875,
	dur: 5.1875,
	text: 25.75,
	memo: 25.75,
} as const;

/** index / starttime / endtime 고정 너비(px) */
const FIXED_COL_WIDTH = {
	index: 54,
	starttime: 108,
	endtime: 108,
} as const;

const LINE_HEIGHT_RATE = 1.65;
const PADDING_DIVISOR = 4.5;
const DEFAULT_FONT_SIZE = 14;

const createCellStyle = (fontSize = DEFAULT_FONT_SIZE) => {
	const size = fontSize > 0 ? fontSize : DEFAULT_FONT_SIZE;
	return {
		fontSize: size,
		lineHeight: Math.floor(size * LINE_HEIGHT_RATE),
		padding: Math.floor(size / PADDING_DIVISOR),
	};
};

/** line * lineHeight + padding * 2 + 1 */
const rowContentHeight = (
	lines: number,
	cellStyle: ReturnType<typeof createCellStyle>,
) => lines * cellStyle.lineHeight + cellStyle.padding * 2 + 1;

const DEFAULT_CELL_STYLE = createCellStyle(DEFAULT_FONT_SIZE);

/** 1줄 기준 행 높이 (가상화 fallback) */
const DEFAULT_ESTIMATE_ROW_HEIGHT = rowContentHeight(1, DEFAULT_CELL_STYLE);

const FORMAT_COLUMNS = {
	smi: ['index', 'starttime', 'dur', 'text', 'memo'],
	srt: ['index', 'starttime', 'endtime', 'dur', 'text', 'memo'],
} as const satisfies Record<SheetFormat, readonly SheetColumnId[]>;

const EDITABLE_COLUMNS = {
	smi: ['starttime', 'text', 'memo'],
	srt: ['starttime', 'endtime', 'text', 'memo'],
} as const satisfies Record<SheetFormat, readonly SheetColumnId[]>;

const COLUMN_LABELS: Record<SheetColumnId, string> = {
	index: '#',
	starttime: 'Start',
	endtime: 'End',
	dur: 'Dur',
	text: 'Text',
	memo: 'Memo',
};

const getColumnWidth = (fontSize: number, id: SheetColumnId): number =>
	Math.ceil(fontSize * COLUMN_WIDTH_RATE[id]);

const createColumnWidths = (fontSize = DEFAULT_FONT_SIZE) =>
	({
		index: FIXED_COL_WIDTH.index,
		starttime: FIXED_COL_WIDTH.starttime,
		endtime: FIXED_COL_WIDTH.endtime,
		dur: getColumnWidth(fontSize, 'dur'),
		text: getColumnWidth(fontSize, 'text'),
		memo: getColumnWidth(fontSize, 'memo'),
	}) as const;

const COLUMN_WIDTHS = createColumnWidths();

/** format별 시트 본문 min-width (memo 이전 열 합 + memo) */
const createContainMinWidth = (fontSize = DEFAULT_FONT_SIZE) => {
	const widths = createColumnWidths(fontSize);

	const sumUntilMemo = (format: SheetFormat) => {
		let total = 0;
		for (const id of FORMAT_COLUMNS[format]) {
			total += widths[id];
			if (id === 'memo') break;
		}
		return total;
	};

	return {
		smi: sumUntilMemo('smi'),
		srt: sumUntilMemo('srt'),
	} as const;
};

const CONTAIN_MIN_WIDTH = createContainMinWidth();

const isEditableColumn = (format: SheetFormat, id: SheetColumnId): boolean =>
	(EDITABLE_COLUMNS[format] as readonly SheetColumnId[]).includes(id);

/** format 열 순서 기준 셀 left (memo 이전 누적) */
const getColumnLeft = (
	format: SheetFormat,
	column: SheetColumnId,
	fontSize = DEFAULT_FONT_SIZE,
): number => {
	const widths = createColumnWidths(fontSize);
	let left = 0;
	for (const id of FORMAT_COLUMNS[format]) {
		if (id === column) return left;
		left += widths[id];
	}
	return left;
};

const getColumns = (format: SheetFormat): SheetColumnDef[] =>
	FORMAT_COLUMNS[format].map((id) => ({
		id,
		label: COLUMN_LABELS[id],
		editable: isEditableColumn(format, id),
	}));

/** 루트에 주입할 열 CSS 변수 (`--sheet-col-*`, `--sheet-contain-min`) */
const createColumnVars = (
	format: SheetFormat,
	fontSize = DEFAULT_FONT_SIZE,
): Record<`--sheet-col-${SheetColumnId}` | '--sheet-contain-min', string> => {
	const widths = createColumnWidths(fontSize);
	const containMin = createContainMinWidth(fontSize)[format];
	return {
		'--sheet-col-index': `${widths.index}px`,
		'--sheet-col-starttime': `${widths.starttime}px`,
		'--sheet-col-endtime': `${widths.endtime}px`,
		'--sheet-col-dur': `${widths.dur}px`,
		'--sheet-col-text': `${widths.text}px`,
		'--sheet-col-memo': `${widths.memo}px`,
		'--sheet-contain-min': `${containMin}px`,
	};
};

export {
	COLUMN_LABELS,
	COLUMN_WIDTHS,
	CONTAIN_MIN_WIDTH,
	DEFAULT_CELL_STYLE,
	DEFAULT_ESTIMATE_ROW_HEIGHT,
	DEFAULT_FONT_SIZE,
	EDITABLE_COLUMNS,
	FORMAT_COLUMNS,
	createCellStyle,
	createContainMinWidth,
	getColumnLeft,
	getColumns,
	createColumnVars,
	isEditableColumn,
	rowContentHeight,
};
