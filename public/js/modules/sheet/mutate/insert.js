import { formatTimecode } from '../../utils/index.js';

/**
 * 타임라인 행 삽입.
 *
 * @param {{ sheet: object }} deps
 * @returns {(entry: { index?: number, data: object }) => object}
 */
const createInsert = ({ sheet }) => {
	const fillDefaultTimes = (data, neighbor, format) => {
		if (!neighbor) return;
		if (format === 'srt') {
			if (Number(data.start) === 0) data.start = neighbor.end;
			if (Number(data.end) === 0) data.end = neighbor.end;
			return;
		}
		if (format === 'smi' && Number(data.start) === 0) data.start = neighbor.start;
	};

	return (entry) => {
		if (sheet.edit.state) sheet.edit.off();
		if (isNaN(entry.index)) entry.index = sheet.timelines.length;

		const { format, timelines, errorRows, rowInfo, cellStyle } = sheet;
		const { lineHeight, padding } = cellStyle;
		const { data, index: insertIndex } = entry;
		const lastIndexBefore = sheet.lastIndex;

		const neighbor =
			insertIndex < lastIndexBefore
				? timelines[insertIndex]
				: insertIndex > 0
					? timelines[insertIndex - 1]
					: null;
		fillDefaultTimes(data, neighbor, format);

		timelines.splice(insertIndex, 0, data);
		sheet.current.row = insertIndex;

		const timelineInfo = {
			line: data.text.split('<br').length,
			height: 0,
			starttime: formatTimecode(data.start),
		};
		timelineInfo.height = timelineInfo.line * lineHeight + padding * 2 + 1;
		sheet.height += timelineInfo.height;
		if (format === 'srt') timelineInfo.endtime = formatTimecode(data.end);
		rowInfo.splice(insertIndex, 0, timelineInfo);

		for (let i = 0; i < errorRows.length; i++) {
			if (errorRows[i] >= insertIndex) ++errorRows[i];
		}

		for (let rowIndex = insertIndex - 2; rowIndex < insertIndex + 2; rowIndex++) {
			if (rowIndex < 0 || rowIndex >= sheet.lastIndex) continue;

			const errorIndex = errorRows.indexOf(rowIndex);
			if (errorIndex > -1) errorRows.splice(errorIndex, 1);

			const current = timelines[rowIndex];
			const next = timelines[rowIndex + 1];
			if (format === 'srt') {
				if (Number(current.start) > Number(current.end)) {
					errorRows.push(rowIndex);
				} else if (Number(current.end) > Number(next.start)) {
					errorRows.push(rowIndex);
				}
			} else if (format === 'smi') {
				if (Number(current.start) > Number(next.start)) {
					errorRows.push(rowIndex);
				}
			}
		}

		sheet.panel.style.height = `${sheet.height}px`;
		sheet.needsRedraw = true;
		sheet.render();
		sheet.move.event();
		sheet.autoSave();
		sheet.search.error(errorRows);
		return entry;
	};
};

export { createInsert };
