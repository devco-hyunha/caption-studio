/** Next Sheet와 동일한 fontSize 배수. 너비 = ceil(fontSize * rate) */
const COL_RATE = Object.freeze({
	index: 3.5625,
	starttime: 7.1875,
	endtime: 7.1875,
	dur: 5.1875,
	text: 25.75,
	memo: 25.75,
});

/** Next: lineheight = floor(fontSize * 1.65) */
const LINE_HEIGHT_RATE = 1.65;
/** Next: padding = floor(fontSize / 4.5) */
const PADDING_DIVISOR = 4.5;

/** 현재 CSS `#sheet { font-size: 14px }` 기본값 */
const DEFAULT_FONT_SIZE = 14;

/**
 * format별 열 순서 (헤더 · 행 HTML과 동일)
 * @type {Readonly<Record<string, readonly string[]>>}
 */
const FORMAT_COLUMNS = Object.freeze({
	smi: Object.freeze(['index', 'starttime', 'dur', 'text', 'memo']),
	srt: Object.freeze(['index', 'starttime', 'endtime', 'dur', 'text', 'memo']),
});

/**
 * 편집 가능한 열 (move.target · trigger left 대상)
 * @type {Readonly<Record<string, readonly string[]>>}
 */
const EDITABLE_COLUMNS = Object.freeze({
	smi: Object.freeze(['starttime', 'text', 'memo']),
	srt: Object.freeze(['starttime', 'endtime', 'text', 'memo']),
});

/**
 * @param {number} [fontSize]
 * @returns {{ fontSize: number, lineHeight: number, padding: number }}
 */
const createCellStyle = (fontSize = DEFAULT_FONT_SIZE) => {
	const size = Number(fontSize) > 0 ? Number(fontSize) : DEFAULT_FONT_SIZE;
	return Object.freeze({
		fontSize: size,
		lineHeight: Math.floor(size * LINE_HEIGHT_RATE),
		padding: Math.floor(size / PADDING_DIVISOR),
	});
};

/**
 * Next와 동일: line * lineHeight + padding * 2 + 1
 *
 * @param {number} lines
 * @param {{ lineHeight: number, padding: number }} cellStyle
 * @returns {number}
 */
const rowContentHeight = (lines, cellStyle) =>
	lines * cellStyle.lineHeight + cellStyle.padding * 2 + 1;

/**
 * @param {number} fontSize
 * @param {string} name
 * @returns {number}
 */
const widthFor = (fontSize, name) => {
	const rate = COL_RATE[name];
	if (rate == null) return 0;
	return Math.ceil(fontSize * rate);
};

/**
 * @param {number} fontSize
 * @param {string} format
 * @param {string} column
 * @returns {number}
 */
const leftFor = (fontSize, format, column) => {
	const columns = FORMAT_COLUMNS[format];
	if (!columns) return 0;
	let left = 0;
	for (const name of columns) {
		if (name === column) return left;
		if (name === 'memo') continue;
		left += widthFor(fontSize, name);
	}
	return left;
};

/**
 * fontSize 기준 열 메트릭을 만든다.
 *
 * @param {number} [fontSize]
 */
const createColumnMetrics = (fontSize = DEFAULT_FONT_SIZE) => {
	const cellStyle = createCellStyle(fontSize);
	const size = cellStyle.fontSize;
	const width = Object.freeze({
		index: widthFor(size, 'index'),
		starttime: widthFor(size, 'starttime'),
		endtime: widthFor(size, 'endtime'),
		dur: widthFor(size, 'dur'),
		text: widthFor(size, 'text'),
		memo: widthFor(size, 'memo'),
	});

	const colLeft = Object.freeze({
		smi: Object.freeze({
			starttime: leftFor(size, 'smi', 'starttime'),
			text: leftFor(size, 'smi', 'text'),
			memo: leftFor(size, 'smi', 'memo'),
		}),
		srt: Object.freeze({
			starttime: leftFor(size, 'srt', 'starttime'),
			endtime: leftFor(size, 'srt', 'endtime'),
			text: leftFor(size, 'srt', 'text'),
			memo: leftFor(size, 'srt', 'memo'),
		}),
	});

	const moveLeft = Object.freeze({
		smi: Object.freeze(EDITABLE_COLUMNS.smi.map((name) => colLeft.smi[name])),
		srt: Object.freeze(EDITABLE_COLUMNS.srt.map((name) => colLeft.srt[name])),
	});

	const memoGutter = Object.freeze({
		smi: colLeft.smi.memo,
		srt: colLeft.srt.memo,
	});

	const containMinWidth = Object.freeze({
		smi: memoGutter.smi + width.memo,
		srt: memoGutter.srt + width.memo,
	});

	return Object.freeze({
		fontSize: size,
		cellStyle,
		width,
		colLeft,
		moveLeft,
		memoGutter,
		containMinWidth,
	});
};

const DEFAULT_METRICS = createColumnMetrics(DEFAULT_FONT_SIZE);
const DEFAULT_CELL_STYLE = DEFAULT_METRICS.cellStyle;
const MOVE_LEFT = DEFAULT_METRICS.moveLeft;

/**
 * sheet.cellStyle.fontSize 기준 메트릭 (캐시 있으면 재사용)
 *
 * @param {object} sheet
 */
const getColumnMetrics = (sheet) => {
	const fontSize = sheet?.cellStyle?.fontSize ?? DEFAULT_FONT_SIZE;
	if (sheet?.columnMetrics?.fontSize === fontSize) return sheet.columnMetrics;
	return createColumnMetrics(fontSize);
};

/**
 * CSS 변수 · move.left · sheet.columnMetrics · cellStyle을 갱신한다.
 *
 * @param {object} sheet
 */
const applyColumnLayout = (sheet) => {
	const metrics = createColumnMetrics(sheet.cellStyle?.fontSize ?? DEFAULT_FONT_SIZE);
	sheet.columnMetrics = metrics;
	sheet.cellStyle = { ...metrics.cellStyle };
	if (sheet.move) sheet.move.left = metrics.moveLeft;

	const root = sheet.root;
	if (!root?.style) return metrics;

	const { cellStyle } = metrics;
	root.style.fontSize = `${cellStyle.fontSize}px`;
	root.style.lineHeight = `${cellStyle.lineHeight}px`;
	root.style.setProperty('--sheet-line-height', `${cellStyle.lineHeight}px`);
	root.style.setProperty('--sheet-cell-padding', `${cellStyle.padding}px`);
	Object.entries(metrics.width).forEach(([name, px]) => {
		root.style.setProperty(`--sheet-col-${name}`, `${px}px`);
	});
	root.style.setProperty('--sheet-contain-min-smi', `${metrics.containMinWidth.smi}px`);
	root.style.setProperty('--sheet-contain-min-srt', `${metrics.containMinWidth.srt}px`);
	return metrics;
};

/**
 * 글꼴 크기 등 cellStyle을 반영한다. UI는 이후 연결.
 *
 * @param {object} sheet
 * @param {{ fontSize?: number }} style
 */
const setCellStyle = (sheet, style) => {
	const fontSize = style.fontSize ?? sheet.cellStyle?.fontSize ?? DEFAULT_FONT_SIZE;
	sheet.cellStyle = { ...createCellStyle(fontSize) };
	applyColumnLayout(sheet);
	sheet.convert?.();
	sheet.needsRedraw = true;
	sheet.render?.();
};

export {
	COL_RATE,
	LINE_HEIGHT_RATE,
	PADDING_DIVISOR,
	DEFAULT_FONT_SIZE,
	DEFAULT_METRICS,
	DEFAULT_CELL_STYLE,
	MOVE_LEFT,
	FORMAT_COLUMNS,
	EDITABLE_COLUMNS,
	createCellStyle,
	rowContentHeight,
	createColumnMetrics,
	getColumnMetrics,
	applyColumnLayout,
	setCellStyle,
};
