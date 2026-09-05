import { getColumnMetrics } from '../layout/columns.js';
import { MEMO_CLAMP_OFFSET } from '../constants.js';
import { formatDurationSec } from '../helpers/formatDurationSec.js';

/**
 * @typedef {Object} StartRow
 * @property {number} index - 그리기 시작 행
 * @property {number} [offset]
 * @property {number} [height]
 */

/**
 * @param {number[]} errorRows
 * @param {number[]} selectedRows
 * @param {number} index
 * @returns {string}
 */
const rowClassSuffix = (errorRows, selectedRows, index) => {
	let suffix = '';
	if (errorRows.includes(index)) suffix += ' error';
	if (selectedRows.includes(index)) suffix += ' multiple';
	return suffix;
};

/**
 * format에 맞는 시트 행 HTML을 만든다.
 *
 * @param {{ sheet: object, startRow: StartRow }} options
 * @returns {string}
 */
const renderRowsHtml = ({ sheet, startRow }) => {
	if (sheet.format !== 'smi' && sheet.format !== 'srt') return '';

	const { timelines, rowInfo, canvas, errorRows, selectedRows, format } = sheet;
	const isSmi = format === 'smi';
	const left = getColumnMetrics(sheet).colLeft[format];
	const bufferHeight = canvas.bufferHeight;
	const rowCount = timelines.length;

	let html = '';
	let filledHeight = 0;
	let index = startRow.index < 0 ? 0 : startRow.index;

	while (index < rowCount && bufferHeight >= filledHeight) {
		const timeline = timelines[index];
		const info = rowInfo[index];

		if (timeline) {
			let duration = '';
			let endtimeHtml = '';

			if (isSmi) {
				const hasNext = index < rowCount - 1;
				if (hasNext) {
					timeline.end = timelines[index + 1].start;
					duration = formatDurationSec(timeline);
				}
			} else {
				duration = formatDurationSec(timeline);
				endtimeHtml = `<div class="col col-1 endtime" tabindex="-1" data-row="${index}" data-col="1" data-left="${left.endtime}" data-target="endtime"><div class="cell">${info.endtime}</div></div>`;
			}

			const textCol = isSmi ? 1 : 2;
			const memoCol = isSmi ? 2 : 3;

			html += `<div class="sheet-row row-${index}${rowClassSuffix(errorRows, selectedRows, index)}">
				<div class="col index"><div class="cell">${index + 1}</div></div>
				<div class="col col-0 starttime" tabindex="-1" data-row="${index}" data-col="0" data-left="${left.starttime}" data-target="starttime"><div class="cell">${info.starttime}</div></div>
				${endtimeHtml}
				<div class="col dur"><div class="cell">${duration}</div></div>
				<div class="col col-${textCol} text" tabindex="-1" data-row="${index}" data-col="${textCol}" data-left="${left.text}" data-target="text"><div class="cell">${timeline.text}<br></div></div>
				<div class="col col-${memoCol} memo" tabindex="-1" data-row="${index}" data-col="${memoCol}" data-left="${left.memo}" data-target="memo"><div class="cell" style="-webkit-line-clamp:${info.line};max-height:${info.height - MEMO_CLAMP_OFFSET}px;">${timeline.memo || ''}<br></div></div>
			</div>`;
		}

		filledHeight += info.height;
		index++;
	}

	return html;
};

export { renderRowsHtml };
