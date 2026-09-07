import { bindEvent } from '../../utils/dom.js';

/**
 * `.sheet-body` 스크롤 이벤트를 바인딩한다.
 *
 * @param {object} sheet
 */
const bindScroll = (sheet) => {
	if (!sheet.body) return;

	bindEvent({
		target: sheet.body,
		event: 'scroll.sheet',
		handler: () => {
			const activeDoc = sheet.sheets?.[sheet.activeSheetIndex];
			if (activeDoc) activeDoc.scroll = sheet.body.scrollTop;
			sheet.stateUpdate();
			sheet.render();
		},
	});
	bindEvent({
		target: sheet.body,
		event: 'scrollend.sheet',
		handler: () => {
			sheet.needsRedraw = true;
			sheet.render();
		},
	});
};

export { bindScroll };
