import { applyColumnLayout } from '../layout/columns.js';

/**
 * `#sheet` 루트와 하위 핸들을 바인딩하고 열 레이아웃을 적용한다.
 *
 * @param {object} sheet
 * @param {string} target - `#sheet` 등 셀렉터
 * @returns {Element | null}
 */
const bindDom = (sheet, target) => {
	const root = document.querySelector(target);
	if (!root) return null;

	sheet.root = root;
	sheet.head = root.querySelector('.sheet-head');
	sheet.headPanel = sheet.head?.querySelector('.sheet-panel') ?? null;
	sheet.body = root.querySelector('.sheet-body');
	sheet.bodyScroll = sheet.body?.querySelector('.sheet-body-scroll') ?? null;
	sheet.panel = sheet.bodyScroll?.querySelector('.sheet-panel') ?? null;
	applyColumnLayout(sheet);
	return root;
};

export { bindDom };
