import { bindEvent } from '../../utils/dom.js';
import { createClick } from './click.js';

/**
 * 패널 셀 클릭·우클릭·더블클릭(편집)을 바인딩한다.
 *
 * @param {object} sheet
 */
const bindPanel = (sheet) => {
	if (!sheet.panel) return;

	let clickCount = 0;
	let clickCurrent = null;
	const handleClick = createClick(sheet);

	bindEvent({
		target: sheet.panel,
		event: 'click.sheet',
		selector: '.col',
		handler: (event, matched) => {
			event.preventDefault();
			event.stopPropagation();
			sheet.shift = event.shiftKey;
			const current = {
				row: Number(matched.dataset.row),
				col: Number(matched.dataset.col),
				left: matched.dataset.left,
				target: matched.dataset.target,
			};
			if (!clickCurrent || clickCurrent.row == current.row && clickCurrent.col == current.col) {
				clickCount++;
				clickCurrent = current;
			}
			if (clickCount === 1) {
				if (!sheet.multiple.state) handleClick(matched);
				setTimeout(() => {
					clickCurrent = null;
					clickCount = 0;
				}, 400);
			} else if (clickCount === 2) {
				if (!sheet.multiple.state) handleClick(matched, true);
				clickCurrent = null;
				clickCount = 0;
			}
		},
	});

	bindEvent({
		target: sheet.panel,
		event: 'contextmenu.sheet',
		selector: '.col',
		handler: (event, matched) => {
			event.preventDefault();
			event.stopPropagation();
			if (!sheet.multiple.state) handleClick(matched, true);
		},
	});
};

export { bindPanel };
