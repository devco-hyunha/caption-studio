import { formatTimecode } from '../../utils/time.js';
import { rowContentHeight, createCellStyle, DEFAULT_FONT_SIZE } from '../layout/columns.js';

/**
 * @typedef {Object} ConvertDeps
 * @property {object} sheet
 */

/**
 * timelines → rowInfo / 높이 / 에러를 재계산하는 함수를 만든다.
 *
 * @param {ConvertDeps} deps
 * @returns {() => void}
 */
const createConvert = ({ sheet }) => () => {
	sheet.stateUpdate();
	sheet.searchHits = [];
	sheet.rowInfo = [];
	sheet.errorRows = [];
	sheet.height = 0;

	const cellStyle = sheet.cellStyle ?? createCellStyle(DEFAULT_FONT_SIZE);
	const { format, lastIndex, errorRows, rowInfo } = sheet;

	sheet.timelines.forEach((timeline, index, list) => {
		const info = {};
		if (Number.isNaN(Number(timeline.start)) && !Number.isNaN(Number(timeline.sync))) {
			timeline.start = timeline.sync;
		}
		info.line = timeline.text.split('<br').length;
		const nextTimeline = list[index + 1];
		info.height = rowContentHeight(info.line, cellStyle);
		sheet.height += info.height;
		info.starttime = formatTimecode(timeline.start);
		if (format === 'srt') {
			info.endtime = formatTimecode(timeline.end);
		}
		if (nextTimeline) {
			info.next = Number(nextTimeline.start);
		}
		if (format === 'srt') {
			if (index < lastIndex && Number(timeline.end) > Number(info.next)) {
				errorRows.push(index);
			} else if (Number(timeline.end) < Number(timeline.start)) {
				errorRows.push(index);
			}
		} else if (format === 'smi') {
			if (index < lastIndex && Number(timeline.start) > Number(info.next)) {
				errorRows.push(index);
			}
		}
		rowInfo[index] = info;
	});

	if (sheet.panel) sheet.panel.style.height = `${sheet.height}px`;
	sheet.search.error(sheet.errorRows);
};

export { createConvert };
