import { bindDom } from './bindDom.js';
import { bindPanel } from './bindPanel.js';
import { bindScroll } from './bindScroll.js';
import { bindWindow } from './bindWindow.js';
import { bindToolbar } from './bindToolbar.js';
import { bindNewSheet } from './bindNewSheet.js';

/**
 * @typedef {Object} InitDeps
 * @property {object} sheet
 * @property {{ Dialog: Function, Confirm: Function }} ui
 * @property {{ t: (key: string) => string }} i18n
 */

/**
 * 시트 DOM·스크롤·툴바 이벤트를 바인딩하는 init 함수를 만든다.
 *
 * @param {InitDeps} deps
 * @returns {(target: string) => void}
 */
const createInit = ({ sheet, ui, i18n }) => (target) => {
	if (!bindDom(sheet, target)) return;

	bindPanel(sheet);
	bindScroll(sheet);
	bindWindow(sheet);

	sheet.trigger.init();
	sheet.edit.color.init();

	bindToolbar(sheet, ui);
	bindNewSheet(sheet, ui, i18n);
};

export { createInit };
