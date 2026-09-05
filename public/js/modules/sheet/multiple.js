import { extend } from '../utils/index.js';
import { setDisabled, syncToolbar } from './helpers/toolbarState.js';

/**
 * 다중 행 선택 API.
 *
 * @param {{ sheet: object }} deps
 * @returns {object}
 */
const createMultiple = ({ sheet }) => {
	const multiple = {
		state: false,
		start: null,
	};
	const multipleBtn = document.querySelector('#sheet-multiple');

	const setRowMultiple = (rowIndex, on) => {
		sheet.panel?.querySelector(`.row-${rowIndex}`)?.classList.toggle('multiple', on);
	};

	const enterMultiple = () => {
		sheet.selectedRows = [];
		multiple.state = true;
		multiple.start = sheet.current.row;
		multiple.toggleRow(sheet.current.row);
		multipleBtn?.classList.add('on');
		setDisabled('.btn-single-controls', true);
		setDisabled('.btn-multiple-controls', false);
	};

	const exitMultiple = () => {
		sheet.selectedRows = [];
		multiple.state = false;
		multiple.start = null;
		sheet.panel?.querySelectorAll('.multiple').forEach((node) => {
			node.classList.remove('multiple');
		});
		multipleBtn?.classList.remove('on');
		setDisabled('.btn-single-controls', false);
		syncToolbar(sheet.current.target);
		sheet.edit.history();
	};

	multiple.toggle = () => {
		if (!multiple.state) {
			enterMultiple();
			return;
		}
		exitMultiple();
	};

	multiple.toggleRow = (row) => {
		if (!sheet.shift) {
			multiple.start = row;
			const currentIndex = sheet.selectedRows.indexOf(row);
			if (currentIndex === -1) {
				setRowMultiple(row, true);
				sheet.selectedRows.push(row);
				return;
			}
			setRowMultiple(row, false);
			sheet.selectedRows.splice(currentIndex, 1);
			return;
		}

		const selectionStart = Math.min(multiple.start, row);
		const selectionEnd = Math.max(multiple.start, row);
		for (let selectionIndex = selectionStart; selectionIndex <= selectionEnd; selectionIndex++) {
			if (sheet.selectedRows.indexOf(selectionIndex) !== -1) continue;
			sheet.selectedRows.push(selectionIndex);
			setRowMultiple(selectionIndex, true);
		}
	};

	multiple.update = (entries, position) => {
		extend(sheet.current, position);
		entries.forEach(({ index, data }) => {
			sheet.timelines[index] = data;
		});
		sheet.convert();
		sheet.needsRedraw = true;
		sheet.render();
		sheet.move.event();
	};

	return multiple;
};

export { createMultiple };
