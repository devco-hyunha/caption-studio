import type { RowHeightInfo } from '../types';
import { DEFAULT_FONT_SIZE, createCellStyle, rowContentHeight } from './columns';

/** text HTML의 `<br` 기준 줄 수 */
const countTextLines = (html: string) => {
	if (!html) return 1;
	return Math.max(1, html.split('<br').length);
};

/** text 열 `<br` 줄 수 기준 행 높이(px) */
const calcRowHeight = (textHtml: string, fontSize = DEFAULT_FONT_SIZE) => {
	const cellStyle = createCellStyle(fontSize);
	const lines = countTextLines(textHtml);
	return rowContentHeight(lines, cellStyle);
};

const sumRowHeights = (rows: readonly RowHeightInfo[]) =>
	rows.reduce((total, row) => total + row.height, 0);

export { calcRowHeight, countTextLines, sumRowHeights };
