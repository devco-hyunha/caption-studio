import { bindEvent } from '../../utils/dom.js';

/**
 * 새 시트 버튼 확인 다이얼로그를 바인딩한다.
 * 활성 탭의 timelines만 비운다 (탭 구조는 유지).
 *
 * @param {object} sheet
 * @param {{ confirm: Function }} ui
 * @param {{ t: (key: string) => string }} i18n
 */
const bindNewSheet = (sheet, ui, i18n) => {
	bindEvent({
		target: document.querySelector('#new-sheet'),
		event: 'click',
		handler: (event) => {
			event.preventDefault();
			document.querySelector('#nav-trigger')?.click();
			ui.confirm({
				title: i18n.t('new-file'),
				content: i18n.t('new-file-contents'),
				bgDismiss: true,
				success: () => {
					sheet.tabs.clearActive();
					sheet.current.row = 0;
					sheet.current.col = 0;
					sheet.move.event();
				},
			});
		},
	});
};

export { bindNewSheet };
