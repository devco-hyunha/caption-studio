import { formatTimecode } from '../../utils/index.js';
import { MEMO_CLAMP_OFFSET } from '../constants.js';
import { formatDurationSec } from '../helpers/formatDurationSec.js';

/**
 * @param {{ row: Element | null | undefined, selector: string, text: string }} params
 */
const setChildText = ({ row, selector, text }) => {
	const host = row?.querySelector(selector);
	const child = host?.firstElementChild ?? host;
	if (child) child.textContent = text;
};

/**
 * 셀 타깃별 DOM·에러행 갱신 핸들러.
 *
 * @param {{ sheet: object }} deps
 * @returns {{ smi: object, srt: object }}
 */
const createUpdateTarget = ({ sheet }) => {
	const findRow = (rowIndex) => sheet.panel?.querySelector(`.row-${rowIndex}`) ?? null;

	const findCol = (rowIndex, colIndex) =>
		findRow(rowIndex)?.querySelector(`.col-${colIndex}`) ?? null;

	/**
	 * @param {{ row: Element | null | undefined, rowIndex: number, isError: boolean }} params
	 */
	const setRowError = ({ row, rowIndex, isError }) => {
		const errorIndex = sheet.errorRows.indexOf(rowIndex);
		if (isError) {
			if (errorIndex === -1) sheet.errorRows.push(rowIndex);
			row?.classList.add('error');
			return;
		}
		if (errorIndex !== -1) sheet.errorRows.splice(errorIndex, 1);
		row?.classList.remove('error');
	};

	const updateText = (position, timeline) => {
		const row = findRow(position.row);
		const col = row?.querySelector(`.col-${position.col}`) ?? null;
		const cell = col?.querySelector('.cell');
		if (cell) cell.innerHTML = `${timeline.text}<br />`;

		const originLine = sheet.rowInfo[position.row].line;
		const newLine = timeline[sheet.current.target].split('<br').length;
		if (originLine !== newLine) {
			const durLine = newLine - originLine;
			const durHeight = durLine * sheet.cellStyle.lineHeight;
			sheet.rowInfo[position.row].line = newLine;
			sheet.rowInfo[position.row].height += durHeight;
			sheet.height += durHeight;
			sheet.panel.style.height = `${sheet.height}px`;
			const memoCell = row?.querySelector('.memo > .cell');
			if (memoCell) {
				memoCell.style.webkitLineClamp = String(newLine);
				memoCell.style.maxHeight = `${sheet.rowInfo[position.row].height - MEMO_CLAMP_OFFSET}px`;
			}
		}
		sheet.trigger.focus(col);
	};

	const updateMemo = (position, timeline) => {
		const col = findCol(position.row, position.col);
		const cell = col?.querySelector('.cell');
		if (cell) cell.innerHTML = `${timeline.memo}<br />`;
		sheet.trigger.focus(col);
	};

	const smiStarttime = (position, timeline) => {
		const row = findRow(position.row);
		const prev = sheet.timelines[position.row - 1];
		const next = sheet.timelines[position.row + 1];

		setRowError({
			row,
			rowIndex: position.row,
			isError: !!(next && Number(timeline.start) > Number(next.start)),
		});

		if (prev) {
			prev.end = timeline.start;
			const prevRow = row?.previousElementSibling;
			setChildText({ row: prevRow, selector: '.dur', text: formatDurationSec(prev) });
			setRowError({
				row: prevRow,
				rowIndex: position.row - 1,
				isError: Number(prev.start) > Number(timeline.start),
			});
		}

		sheet.rowInfo[position.row].starttime = formatTimecode(timeline.start);
		if (next) {
			timeline.end = next.start;
			setChildText({
				row,
				selector: '.dur',
				text: formatDurationSec({ start: timeline.start, end: next.start }),
			});
		}
		setChildText({
			row,
			selector: '.starttime',
			text: sheet.rowInfo[position.row].starttime,
		});
		sheet.search.error(sheet.errorRows);
	};

	const srtTime = (position, timeline) => {
		const row = findRow(position.row);
		const prev = sheet.timelines[position.row - 1];
		const next = sheet.timelines[position.row + 1];

		const isSelfError =
			(next && Number(timeline.end) > Number(next.start)) ||
			Number(timeline.start) > Number(timeline.end);
		setRowError({ row, rowIndex: position.row, isError: isSelfError });

		if (prev) {
			const prevRow = row?.previousElementSibling;
			setRowError({
				row: prevRow,
				rowIndex: position.row - 1,
				isError: Number(prev.end) > Number(timeline.start),
			});
		}

		sheet.rowInfo[position.row].starttime = formatTimecode(timeline.start);
		sheet.rowInfo[position.row].endtime = formatTimecode(timeline.end);
		setChildText({ row, selector: '.starttime', text: sheet.rowInfo[position.row].starttime });
		setChildText({ row, selector: '.endtime', text: sheet.rowInfo[position.row].endtime });
		setChildText({ row, selector: '.dur', text: formatDurationSec(timeline) });
		sheet.search.error(sheet.errorRows);
	};

	return {
		smi: {
			starttime: smiStarttime,
			text: updateText,
			memo: updateMemo,
		},
		srt: {
			time: srtTime,
			starttime: srtTime,
			endtime: srtTime,
			text: updateText,
			memo: updateMemo,
		},
	};
};

export { createUpdateTarget };
