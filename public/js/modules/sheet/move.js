import { MOVE_LEFT, EDITABLE_COLUMNS } from './layout/columns.js';
import { findRowAfterOffset } from './render/findRowAfterOffset.js';

/**
 * 셀·행·포커스 이동(열·페이지) API를 만든다.
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
				if (sheet.current.row <= 0) return;

				if (sheet.edit?.state) sheet.edit.off();

				const { offsetTop = 0, offsetHeight = 0 } = sheet.trigger.wrap ?? {};
				const canvasTop = sheet.scroll;
				const canvasBottom = sheet.scroll + sheet.canvas.height;
				let moveScroll = canvasBottom < offsetTop - offsetHeight;
				let moveSize =
					canvasTop >= offsetTop || canvasBottom < offsetTop - offsetHeight
						? offsetTop - sheet.canvas.height * 0.875
						: canvasTop;
				if (moveSize < 0) moveSize = 0;

				const found = findRowAfterOffset(sheet.rowInfo, moveSize);
				const moveData = found
					? { offset: found.offset - found.height, index: found.index - 1 }
					: { offset: 0, index: 0 };

				sheet.current.row = moveData.index;
				move.event();
				if (moveScroll) {
					setTimeout(() => {
						sheet.body.scrollTop = moveData.offset;
					}, 0);
				}
			},

			next: () => {
				if (sheet.current.row >= sheet.lastIndex) return;

				if (sheet.edit?.state) sheet.edit.off();

				const { offsetTop = 0, offsetHeight = 0 } = sheet.trigger.wrap ?? {};
				const canvasTop = sheet.scroll - 1;
				const canvasBottom = sheet.scroll + sheet.canvas.height;
				let moveScroll = false;
				let moveSize;
				if (canvasTop > offsetTop || canvasBottom <= offsetTop + offsetHeight) {
					moveSize = offsetTop + sheet.canvas.height * 0.875;
					moveScroll = true;
				} else {
					moveSize = canvasBottom;
				}

				const found = findRowAfterOffset(sheet.rowInfo, moveSize);
				const moveData = found
					? { offset: found.offset, index: found.index - 1 }
					: {
							offset: sheet.height - sheet.rowInfo[sheet.lastIndex].height,
							index: sheet.lastIndex,
						};

				sheet.current.row = moveData.index;
				move.event();
				if (moveScroll) {
					sheet.body.scrollTop = moveData.offset - sheet.canvas.height;
				}
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
