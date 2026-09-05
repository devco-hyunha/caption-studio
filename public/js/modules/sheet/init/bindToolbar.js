import { bindEvent } from '../../utils/dom.js';

/**
 * @param {string} id
 * @param {(event: MouseEvent) => void} onClick
 */
const bindToolbarClick = (id, onClick) => {
	const target = document.getElementById(id);
	if (!target) return;

	bindEvent({
		target,
		event: 'click',
		handler: (event) => {
			event.preventDefault();
			event.stopPropagation();
			if (target.classList.contains('disabled')) return;
			onClick(event);
		},
	});
};

/**
 * 시트 툴바 버튼 이벤트를 바인딩한다.
 *
 * @param {object} sheet
 * @param {{ Dialog: Function }} ui
 */
const bindToolbar = (sheet, ui) => {
	const handleEditClip = (command) => {
		if (sheet.multiple.state) {
			sheet.edit.multiClip(command);
			return;
		}
		sheet.edit.clip(command);
	};

	const handleTimeStep = (command) => {
		if (sheet.multiple.state) {
			sheet.edit.multiClip(command);
			return;
		}
		if (sheet.current.target !== 'starttime' && sheet.current.target !== 'endtime') return;
		if (command === 'plus') {
			sheet.edit.timePlus();
			return;
		}
		sheet.edit.timeMinus();
	};

	bindToolbarClick('time-edit', () => {
		ui.Dialog('time-editor');
	});
	bindToolbarClick('time-plus', () => {
		handleTimeStep('plus');
	});
	bindToolbarClick('time-minus', () => {
		handleTimeStep('minus');
	});
	bindToolbarClick('sheet-edit', () => {
		if (sheet.edit.state) sheet.edit.off();
		else sheet.edit.on();
	});
	bindToolbarClick('sheet-insert', () => {
		sheet.command.insert(sheet.current);
	});
	bindToolbarClick('sheet-remove', () => {
		sheet.command.remove(sheet.current);
	});
	bindToolbarClick('sheet-multiple', () => {
		sheet.multiple.toggle();
	});
	bindToolbarClick('font-bold', () => {
		handleEditClip('bold');
	});
	bindToolbarClick('font-italic', () => {
		handleEditClip('italic');
	});
	bindToolbarClick('font-underline', () => {
		handleEditClip('underline');
	});
	bindToolbarClick('color-reset', () => {
		handleEditClip('color_clear');
	});
	bindToolbarClick('undo', () => {
		sheet.undo();
	});
	bindToolbarClick('redo', () => {
		sheet.redo();
	});
};

export { bindToolbar };
