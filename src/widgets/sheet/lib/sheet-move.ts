import type {
	RowHeightInfo,
	SheetColScrollIntoViewResult,
	SheetColumnId,
	SheetFormat,
	SheetMoveCursor,
	SheetPageMoveResult,
	SheetPageViewBox,
	SheetScrollIntoViewResult,
} from '../types';
import { EDITABLE_COLUMNS } from './columns';

const getEditableColumns = (format: SheetFormat): readonly SheetColumnId[] =>
	EDITABLE_COLUMNS[format];

const getEditableColIndex = (format: SheetFormat, column: SheetColumnId): number =>
	getEditableColumns(format).indexOf(column);

const getEditableColumn = (
	format: SheetFormat,
	col: number,
): SheetColumnId | null => getEditableColumns(format)[col] ?? null;

const getLastIndex = (rowInfo: readonly RowHeightInfo[]) =>
	Math.max(0, rowInfo.length - 1);

/**
 * 행 시작 Y (해당 행 높이 누적 전).
 */
const getRowTop = (rowInfo: readonly RowHeightInfo[], rowIndex: number): number => {
	let top = 0;
	for (let index = 0; index < rowIndex; index++) {
		top += rowInfo[index]?.height ?? 0;
	}
	return top;
};

/**
 * `y`를 포함하는 행 (`start <= y < start + height`).
 */
const findRowContaining = (
	rowInfo: readonly RowHeightInfo[],
	y: number,
	lastIndex: number,
): { index: number; offset: number } => {
	if (!rowInfo.length || y <= 0) return { index: 0, offset: 0 };

	let offset = 0;
	for (let index = 0; index < rowInfo.length; index++) {
		const height = rowInfo[index]?.height ?? 0;
		if (y < offset + height) return { index, offset };
		offset += height;
	}

	return { index: lastIndex, offset: getRowTop(rowInfo, lastIndex) };
};

const moveRowPrev = (cursor: SheetMoveCursor): SheetMoveCursor | null => {
	if (cursor.row <= 0) return null;
	return { row: cursor.row - 1, col: cursor.col };
};

/**
 * @param append - Tab 이동 시 true. 마지막 행이면 append 요청(행 추가) — 호출측에서 처리.
 */
const moveRowNext = (
	cursor: SheetMoveCursor,
	lastIndex: number,
	append: boolean,
): SheetMoveCursor | 'append' | null => {
	if (cursor.row !== lastIndex) {
		return { row: cursor.row + 1, col: cursor.col };
	}
	if (append) return 'append';
	return null;
};

const moveColPrev = (
	format: SheetFormat,
	cursor: SheetMoveCursor,
): SheetMoveCursor | null => {
	if (cursor.col > 0) {
		return { row: cursor.row, col: cursor.col - 1 };
	}
	if (cursor.row <= 0) return null;

	const maxCol = getEditableColumns(format).length - 1;
	return { row: cursor.row - 1, col: maxCol };
};

const moveColNext = (
	format: SheetFormat,
	cursor: SheetMoveCursor,
	lastIndex: number,
): SheetMoveCursor | null => {
	const maxCol = getEditableColumns(format).length - 1;
	if (cursor.col < maxCol) {
		return { row: cursor.row, col: cursor.col + 1 };
	}
	if (cursor.row >= lastIndex) return null;
	return { row: cursor.row + 1, col: 0 };
};

/**
 * PageUp.
 * - 뷰 밖 → 행 유지, 스크롤로 포커스를 뷰 상단에 맞춤
 * - 뷰 안 → 현재 행 기준 뷰포트 높이만큼 위로 점프
 */
const movePagePrev = (
	rowInfo: readonly RowHeightInfo[],
	currentRow: number,
	{ viewTop, viewHeight }: SheetPageViewBox,
): SheetPageMoveResult | null => {
	if (viewHeight <= 0 || !rowInfo.length) return null;

	const lastIndex = getLastIndex(rowInfo);
	const focusTop = getRowTop(rowInfo, currentRow);
	const focusHeight = rowInfo[currentRow]?.height ?? 0;
	const focusBottom = focusTop + focusHeight;
	const viewBottom = viewTop + viewHeight;

	if (focusBottom <= viewTop || focusTop >= viewBottom) {
		return { row: currentRow, scrollTop: focusTop };
	}

	if (currentRow <= 0) return null;

	const target = findRowContaining(
		rowInfo,
		Math.max(0, focusTop - viewHeight),
		lastIndex,
	);
	if (target.index >= currentRow) {
		return { row: currentRow, scrollTop: Math.max(0, viewTop - viewHeight) };
	}

	return { row: target.index, scrollTop: target.offset };
};

/**
 * PageDown.
 */
const movePageNext = (
	rowInfo: readonly RowHeightInfo[],
	currentRow: number,
	{ viewTop, viewHeight }: SheetPageViewBox,
): SheetPageMoveResult | null => {
	if (viewHeight <= 0 || !rowInfo.length) return null;

	const lastIndex = getLastIndex(rowInfo);
	const focusTop = getRowTop(rowInfo, currentRow);
	const focusHeight = rowInfo[currentRow]?.height ?? 0;
	const focusBottom = focusTop + focusHeight;
	const viewBottom = viewTop + viewHeight;

	if (focusBottom <= viewTop || focusTop >= viewBottom) {
		return { row: currentRow, scrollTop: focusBottom - viewHeight };
	}

	if (currentRow >= lastIndex) return null;

	const target = findRowContaining(rowInfo, focusTop + viewHeight, lastIndex);
	if (target.index <= currentRow) {
		return { row: currentRow, scrollTop: viewTop + viewHeight };
	}

	const nextHeight = rowInfo[target.index]?.height ?? 0;
	return {
		row: target.index,
		scrollTop: target.offset + nextHeight - viewHeight,
	};
};

/**
 * 포커스 행이 뷰 밖이면 스크롤을 맞춤.
 */
const scrollRowIntoView = (
	rowInfo: readonly RowHeightInfo[],
	rowIndex: number,
	viewTop: number,
	viewHeight: number,
): SheetScrollIntoViewResult => {
	if (viewHeight <= 0 || !rowInfo[rowIndex]) return { scrollTop: null };

	const focusTop = getRowTop(rowInfo, rowIndex);
	const focusBottom = focusTop + (rowInfo[rowIndex]?.height ?? 0);

	if (viewTop > focusTop) {
		return { scrollTop: Math.max(0, focusTop) };
	}

	if (viewTop + viewHeight < focusBottom) {
		return { scrollTop: Math.max(0, focusBottom - viewHeight) };
	}

	return { scrollTop: null };
};

/**
 * 포커스 열이 가로 뷰포트 밖이면 scrollLeft 맞춤.
 * (`preventScroll` 포커스로 브라우저 기본 가로 스크롤이 막혀 있어 수동 보정)
 *
 * @param stickyLeft - 왼쪽 sticky 열 너비. 가려진 영역은 비가시로 보고 inset 보정.
 */
const scrollColIntoView = (
	focusLeft: number,
	focusWidth: number,
	viewLeft: number,
	viewWidth: number,
	stickyLeft = 0,
): SheetColScrollIntoViewResult => {
	if (viewWidth <= 0 || focusWidth <= 0) return { scrollLeft: null };

	const focusRight = focusLeft + focusWidth;
	const inset = Math.max(0, stickyLeft);

	// sticky 열 자체(또는 그 안쪽)는 항상 보이므로 가로 스크롤 보정 생략
	if (focusRight <= inset) return { scrollLeft: null };

	const visibleLeft = viewLeft + inset;

	if (visibleLeft > focusLeft) {
		return { scrollLeft: Math.max(0, focusLeft - inset) };
	}

	if (viewLeft + viewWidth < focusRight) {
		return { scrollLeft: Math.max(0, focusRight - viewWidth) };
	}

	return { scrollLeft: null };
};

export {
	findRowContaining,
	getEditableColIndex,
	getEditableColumn,
	getEditableColumns,
	getLastIndex,
	getRowTop,
	moveColNext,
	moveColPrev,
	movePageNext,
	movePagePrev,
	moveRowNext,
	moveRowPrev,
	scrollColIntoView,
	scrollRowIntoView,
};
