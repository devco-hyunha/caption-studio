import { clone, extend } from '../../utils/index.js';

/**
 * 단일 행 타임라인 갱신.
 *
 * @param {{ sheet: object }} deps
 * @returns {(position: object, timeline: object) => object}
 */
const createUpdate = ({ sheet }) => (position, timeline) => {
	if (sheet.edit.state) sheet.edit.off();
	extend(sheet.current, position);
	sheet.current.target = sheet.move.target[sheet.format][sheet.current.col];
	const backup = clone(sheet.timelines[position.row]);
	sheet.timelines[position.row] = timeline;
	sheet.updateTarget[sheet.format][sheet.current.target](position, timeline);
	sheet.autoSave();
	sheet.move.event();
	return backup;
};

export { createUpdate };
