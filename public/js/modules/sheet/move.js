import { MOVE_LEFT, EDITABLE_COLUMNS } from './layout/columns.js';

/**
 * @param {{ height: number }[]} rowInfo
 * @param {number} rowIndex
 * @returns {number}
 */
const getRowTop = (rowInfo, rowIndex) => {
	let top = 0;
	for (let index = 0; index < rowIndex; index++) {
		top += rowInfo[index].height;
	}
	return top;
};

/**
 * `y`를 포함하는 행 (`start <= y < start + height`).
 *
 * @param {{ height: number }[]} rowInfo
 * @param {number} y
 * @param {number} lastIndex
 * @returns {{ index: number, offset: number }}
 */
const findRowContaining = (rowInfo, y, lastIndex) => {
	if (!rowInfo?.length || y <= 0) return { index: 0, offset: 0 };

	let offset = 0;
	for (let index = 0; index < rowInfo.length; index++) {
		const height = rowInfo[index].height || 0;
		if (y < offset + height) return { index, offset };
		offset += height;
	}

	return { index: lastIndex, offset: getRowTop(rowInfo, lastIndex) };
};

/**
 * @param {object} sheet
 * @returns {{ viewTop: number, viewHeight: number, viewBottom: number }}
 */
const getViewBox = (sheet) => {
	const viewTop = sheet.body?.scrollTop ?? sheet.scroll ?? 0;
	const viewHeight = sheet.body?.clientHeight || sheet.canvas.height || 0;
	return {
		viewTop,
		viewHeight,
		viewBottom: viewTop + viewHeight,
	};
};

/**
 * @param {object} sheet
 * @param {number} scrollTop
 */
const setSheetScroll = (sheet, scrollTop) => {
	const next = Math.max(0, scrollTop);
	sheet.needsRedraw = true;
	sheet.scroll = next;
	if (sheet.body) sheet.body.scrollTop = next;
};

/**
 * @param {object} sheet
 * @param {number} rowIndex
 * @param {number} [scrollTop]
 */
const moveToRow = (sheet, move, rowIndex, scrollTop) => {
	sheet.current.row = rowIndex;
	if (scrollTop != null) setSheetScroll(sheet, scrollTop);
	move.event();
};

/**
 * 셀·행·포커스 이동(열·페이지) API를 만든다.
 *
 * PageUp/PageDown:
 * - 뷰 밖 → 행 유지, 스크롤로 포커스를 뷰 상단/하단에 맞춤
 * - 뷰 안 → 현재 행 기준 뷰포트 높이만큼 점프 + 스크롤
 *
 * @param {object} sheet
 * @returns {object}
 */
const createMove = (sheet) => {
	const move = {
		target: {
			smi: [...EDITABLE_COLUMNS.smi],
			srt: [...EDITABLE_COLUMNS.srt],
		},
		left: MOVE_LEFT,

		event: () => {
			sheet.current.target = move.target[sheet.format][sheet.current.col];
			sheet.current.info = sheet.rowInfo[sheet.current.row];
			sheet.current.data = sheet.timelines[sheet.current.row];

			sheet.panel?.querySelectorAll('.col.current').forEach((node) => {
				node.classList.remove('current');
			});
			const col = sheet.panel?.querySelector(
				`.row-${sheet.current.row} .col-${sheet.current.col}`,
			);
			col?.classList.add('current');
			sheet.trigger.focus(col);
		},

		page: {
			prev: () => {
				if (sheet.edit?.state) sheet.edit.off();

				const { rowInfo, lastIndex } = sheet;
				const focusTop = getRowTop(rowInfo, sheet.current.row);
				const focusHeight = rowInfo[sheet.current.row]?.height ?? 0;
				const focusBottom = focusTop + focusHeight;
				const { viewTop, viewHeight, viewBottom } = getViewBox(sheet);

				if (viewHeight <= 0) return;

				// 뷰 밖 → 포커스를 뷰 상단에 붙임
				if (focusBottom <= viewTop || focusTop >= viewBottom) {
					setSheetScroll(sheet, focusTop);
					move.event();
					return;
				}

				if (sheet.current.row <= 0) return;

				// 항상 한 화면 위로 (뷰 안 첫 행 스냅은 PageUp 한 줄 버그의 원인이라 제외)
				const target = findRowContaining(
					rowInfo,
					Math.max(0, focusTop - viewHeight),
					lastIndex,
				);
				if (target.index >= sheet.current.row) {
					setSheetScroll(sheet, Math.max(0, viewTop - viewHeight));
					move.event();
					return;
				}

				moveToRow(sheet, move, target.index, target.offset);
			},

			next: () => {
				if (sheet.edit?.state) sheet.edit.off();

				const { rowInfo, lastIndex } = sheet;
				const focusTop = getRowTop(rowInfo, sheet.current.row);
				const focusHeight = rowInfo[sheet.current.row]?.height ?? 0;
				const focusBottom = focusTop + focusHeight;
				const { viewTop, viewHeight, viewBottom } = getViewBox(sheet);

				if (viewHeight <= 0) return;

				if (focusBottom <= viewTop || focusTop >= viewBottom) {
					setSheetScroll(sheet, focusBottom - viewHeight);
					move.event();
					return;
				}

				if (sheet.current.row >= lastIndex) return;

				// PageDown도 동일하게 항상 한 화면 점프
				const target = findRowContaining(
					rowInfo,
					focusTop + viewHeight,
					lastIndex,
				);
				if (target.index <= sheet.current.row) {
					setSheetScroll(sheet, viewTop + viewHeight);
					move.event();
					return;
				}

				const nextHeight = rowInfo[target.index]?.height ?? 0;
				moveToRow(
					sheet,
					move,
					target.index,
					target.offset + nextHeight - viewHeight,
				);
			},
		},

		row: {
			prev: () => {
				if (sheet.current.row <= 0) return;

				--sheet.current.row;
				move.event();
				if (!sheet.multiple?.state) return;
				if (sheet.shift) sheet.multiple.toggleRow(sheet.current.row);
				else sheet.multiple.start = sheet.current.row;
			},

			next: (append) => {
				if (sheet.current.row !== sheet.lastIndex) {
					++sheet.current.row;
					move.event();
					if (sheet.multiple?.state) {
						if (sheet.shift) sheet.multiple.toggleRow(sheet.current.row);
						else sheet.multiple.start = sheet.current.row;
					}
					return;
				}
				if (!sheet.multiple?.state && append) sheet.command.insert(sheet.current);
			},
		},

		col: {
			prev: () => {
				if (sheet.current.col > 0) {
					--sheet.current.col;
					move.event();
					return;
				}
				if (sheet.current.row > 0 && !sheet.multiple?.state) {
					sheet.current.col = move.target[sheet.format].length - 1;
					move.row.prev();
					return;
				}
				return false;
			},

			next: () => {
				const maxCol = move.target[sheet.format].length - 1;
				if (sheet.current.col < maxCol) {
					++sheet.current.col;
					move.event();
					return;
				}
				if (sheet.current.row < sheet.lastIndex && !sheet.multiple?.state) {
					sheet.current.col = 0;
					move.row.next(false);
				}
			},
		},
	};

	return move;
};

export { createMove };
