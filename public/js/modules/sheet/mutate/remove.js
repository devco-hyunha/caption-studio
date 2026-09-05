import { clone } from '../../utils/index.js';

/**
 * 타임라인 행 삭제.
 *
 * @param {{ sheet: object }} deps
 * @returns {(position: { row: number, col: number }) => object}
 */
const createRemove = ({ sheet }) => (position) => {
	if (sheet.edit.state) sheet.edit.off();

	const { format, timelines, errorRows, rowInfo } = sheet;
	const { row, col } = position;

	sheet.height -= rowInfo[row].height;
	sheet.current.row = row;
	sheet.current.col = col;
	const backup = clone(timelines[row]);
	rowInfo.splice(row, 1);
	timelines.splice(row, 1);

	const anchorIndex = row - 1;
	const anchorErrorIndex = errorRows.indexOf(anchorIndex);
	if (anchorErrorIndex > -1) errorRows.splice(anchorErrorIndex, 1);

	for (let i = 0; i < errorRows.length; i++) {
		if (errorRows[i] > anchorIndex) --errorRows[i];
	}

	for (let rowIndex = anchorIndex - 1; rowIndex < anchorIndex + 2; rowIndex++) {
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

	if (sheet.current.row < 0) sheet.current.row = 0;
	if (sheet.current.row > sheet.lastIndex) sheet.current.row = sheet.lastIndex;

	sheet.panel.style.height = `${sheet.height}px`;
	sheet.needsRedraw = true;
	sheet.render();
	sheet.move.event();
	sheet.autoSave();
	sheet.search.error(errorRows);
	return backup;
};

export { createRemove };
