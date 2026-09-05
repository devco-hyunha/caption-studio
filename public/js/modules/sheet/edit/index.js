import { editHistory, clone } from '../../utils/index.js';
import { closeSearchPanel } from '../helpers/closeSearchPanel.js';
import { createTime } from './time.js';
import { createTimeControl } from './timeControl.js';
import { createColor } from './color.js';

/**
 * @typedef {Object} EditDeps
 * @property {object} sheet
 * @property {{ encode: (el: Element) => string }} subtitle
 * @property {object} ui - UI 셸 (layout · dialog · colorPicker)
 */

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

/**
 * 시트 셀 편집 API를 만든다.
 *
 * @param {EditDeps} deps
 * @returns {object}
 */
const createEdit = ({ sheet, subtitle, ui }) => {
	const edit = { state: false };
	const sheetEditBtn = () => document.querySelector('#sheet-edit');

	const focusAndSelect = () => {
		sheet.trigger.input.focus();
		edit.cmd('selectAll');
	};

	// 시간 및 다중 클립 조작 메서드 명시적 할당
	const { multiClip, timePlus, timeMinus } = createTime({ edit, sheet, subtitle });
	edit.multiClip = multiClip;
	edit.timePlus = timePlus;
	edit.timeMinus = timeMinus;

	// 시간 편집기 UI 메서드 명시적 할당
	const { timeControl } = createTimeControl({ edit, sheet, ui });
	edit.timeControl = timeControl;

	// 색상 팔레트 및 피커
	edit.color = createColor({ edit, sheet, ui });

	edit.on = () => {
		if (sheet.search.state) return;

		closeSearchPanel(sheet);
		edit.state = true;
		sheet.trigger.wrap.classList.add('on');
		sheetEditBtn()?.classList.add('on');
		sheet.trigger.input.innerHTML = `${sheet.current.data[sheet.current.target]}<br>`;
		if (document.activeElement !== sheet.trigger.input) setTimeout(focusAndSelect, 0);
		else edit.cmd('selectAll');
		sheet.render();
	};

	edit.off = () => {
		edit.cmd('unselect');
		edit.state = false;
		sheetEditBtn()?.classList.remove('on');
		sheet.trigger.wrap.classList.remove('on', 'clip');
		const clip = clone(sheet.current.data);
		const colText = subtitle.encode(sheet.trigger.input);
		if (clip[sheet.current.target] !== colText) {
			clip[sheet.current.target] = colText;
			sheet.command.update(sheet.current, clip);
		}
		sheet.move.event();
	};

	edit.clip = (cmd) => {
		closeSearchPanel(sheet);
		if (edit.state) {
			if (cmd) edit.cmd(cmd);
			return;
		}
		edit.state = true;
		sheet.trigger.input.innerHTML = sheet.current.data[sheet.current.target];
		sheet.trigger.wrap.classList.add('clip');
		sheet.trigger.wrap.focus();
		focusAndSelect();
		if (cmd) edit.cmd(cmd);
		setTimeout(() => {
			edit.off();
		}, 0);
	};

	edit.cmd = (cmd, attr, value) => {
		if (typeof cmd === 'string') {
			if (cmd.startsWith('color_clear')) {
				attr = 'removeFormat';
				value = 'foreColor';
			} else if (cmd.startsWith('color')) {
				attr = 'foreColor';
				value = edit.color.list[cmd.replace('color', '')];
			} else if (cmd === 'enter') {
				if (isFirefox) {
					attr = 'insertHTML';
					value = '<br />';
				} else {
					attr = 'insertLineBreak';
				}
			} else {
				attr = cmd;
			}
		} else {
			attr = cmd.attr === 'color' ? 'foreColor' : cmd.attr;
			value = cmd.value;
		}
		// Deprecated: document.execCommand — 당장 제거 계획 없음. 후순위(Selection/Range 등으로 교체).
		document.execCommand(attr, false, value);
		return false;
	};

	edit.log = (entry) => {
		editHistory.push(entry);
		edit.history();
	};

	edit.history = () => {
		const count = editHistory.entries.length;
		const index = editHistory.index + 1;
		const undo = document.querySelector('#undo');
		const redo = document.querySelector('#redo');
		if (!undo || !redo) return;

		const canUndo = count > 0 && index > 0;
		const canRedo = count > 0 && index < count;
		undo.classList.toggle('disabled', !canUndo);
		redo.classList.toggle('disabled', !canRedo);
	};

	return edit;
};

export { createEdit };
