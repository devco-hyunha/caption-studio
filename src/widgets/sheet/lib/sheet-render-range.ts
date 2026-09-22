import type { RowHeightInfo, SheetWindowResult } from '../types';
import { findRowAfterOffset } from './find-row-after-offset';
import { sumRowHeights } from './row-height';

const EMPTY_WINDOW: SheetWindowResult = {
	pageIndex: 0,
	startIndex: 0,
	endIndex: 0,
	paddingTop: 0,
	totalHeight: 0,
	indices: [],
};

/**
 * scrollTop을 viewport 높이(page) 단위로 스냅한 뒤,
 * `(pageIndex - 1) … (pageIndex + 1)` ≈ 3 page 버퍼를 채운다.
 *
 * page 안에서는 동일 윈도를 유지해 렌더 횟수를 줄인다.
 */
const getRenderRange = (
	rows: readonly RowHeightInfo[],
	scrollTop: number,
	viewportHeight: number,
): SheetWindowResult => {
	const totalHeight = sumRowHeights(rows);
	const rowCount = rows.length;

	if (rowCount === 0) return { ...EMPTY_WINDOW };

	const viewHeight = Math.max(0, viewportHeight);
	if (viewHeight <= 0) {
		const indices = rows.map((_, index) => index);
		return {
			pageIndex: 0,
			startIndex: 0,
			endIndex: rowCount,
			paddingTop: 0,
			totalHeight,
			indices,
		};
	}

	const pageIndex = Math.floor(Math.max(0, scrollTop) / viewHeight);
	/** 현재 page 기준 앞 1 page부터 시작 (1/2/3 → 2/3/4) */
	const windowScrollStart = Math.max(0, (pageIndex - 1) * viewHeight);
	const bufferHeight = viewHeight * 3;

	const startRow = findRowAfterOffset(rows, windowScrollStart - 1);
	const startIndex = startRow?.index ?? 0;
	const paddingTop = startRow?.offset ?? 0;

	const indices: number[] = [];
	let filledHeight = 0;
	let index = startIndex < 0 ? 0 : startIndex;

	while (index < rowCount && bufferHeight >= filledHeight) {
		const height = rows[index]?.height ?? 0;
		indices.push(index);
		filledHeight += height;
		index += 1;
	}

	return {
		pageIndex,
		startIndex,
		endIndex: index,
		paddingTop,
		totalHeight,
		indices,
	};
};

/** page·윈도 범위가 같으면 React setState 생략용 */
const isSameRenderRange = (a: SheetWindowResult, b: SheetWindowResult) =>
	a.pageIndex === b.pageIndex &&
	a.startIndex === b.startIndex &&
	a.endIndex === b.endIndex &&
	a.paddingTop === b.paddingTop &&
	a.totalHeight === b.totalHeight;

export { getRenderRange, isSameRenderRange };
