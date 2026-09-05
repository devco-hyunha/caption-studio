import { editHistory } from '../utils/index.js';

/**
 * undo / redo 핸들러.
 *
 * @param {{ sheet: object }} deps
 * @returns {{ undo: () => false, redo: () => false }}
 */
const createHistory = ({ sheet }) => {
	const undo = () => {
		const undoBtn = document.querySelector('#undo');
		const prev = editHistory.prev();
		if (prev && !undoBtn?.classList.contains('disabled')) {
			if (prev.command.startsWith('multi.')) {
				sheet.multiple.update(prev.before, prev.current);
			} else if (prev.command === 'insert') {
				prev.current.row = prev.id;
				sheet.remove(prev.current);
			} else if (prev.command === 'remove') {
				sheet.current.col = prev.current.col;
				sheet.insert({ index: prev.id, data: prev.before });
			} else if (
				prev.command === 'update' &&
				JSON.stringify(sheet.timelines[prev.id]) === JSON.stringify(prev.after)
			) {
				sheet.update(prev.current, prev.before);
			}
		} else {
			editHistory.next();
		}
		sheet.edit.history();
		return false;
	};

	const redo = () => {
		const redoBtn = document.querySelector('#redo');
		const next = editHistory.next();
		if (next && !redoBtn?.classList.contains('disabled')) {
			if (next.command.startsWith('multi.')) {
				sheet.multiple.update(next.after, next.current);
			} else if (next.command === 'insert') {
				sheet.current.col = next.current.col;
				sheet.insert({ index: next.id, data: next.after });
			} else if (next.command === 'remove') {
				sheet.remove(next.current);
			} else if (next.command === 'update') {
				sheet.update(next.current, next.after);
			}
		}
		sheet.edit.history();
		return false;
	};

	return { undo, redo };
};

export { createHistory };
