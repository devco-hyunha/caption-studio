import { getColumnMetrics } from './columns.js';

/**
 * 컬럼 타깃별 너비를 구하는 함수를 만든다.
 *
 * @param {object} sheet - format · canvas.width · cellStyle
 * @returns {(target: string) => number | undefined}
 */
const createGetColWidth = (sheet) => (target) => {
	const metrics = getColumnMetrics(sheet);

	if (target === 'memo') {
		const gutter = metrics.memoGutter[sheet.format];
		if (gutter == null) return;
		return sheet.canvas.width - gutter;
	}

	return metrics.width[target];
};

export { createGetColWidth };
