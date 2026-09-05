import { editHistory } from '../../utils/index.js';
import { bindEvent } from '../../utils/dom.js';

/**
 * 새 시트 버튼 확인 다이얼로그를 바인딩한다.
 *
 * @param {object} sheet
 * @param {{ Confirm: Function }} ui
 * @param {{ t: (key: string) => string }} i18n
 */
const bindNewSheet = (sheet, ui, i18n) => {
	bindEvent({
		target: document.querySelector('#new-sheet'),
		event: 'click',
		handler: (event) => {
			event.preventDefault();
			document.querySelector('#nav-trigger')?.click();
			ui.Confirm({
				title: i18n.t('new-file'),
				content: i18n.t('new-file-contents'),
				bgDismiss: true,
				success: () => {
					sheet.set({ timelines: [] });
					sheet.current.row = 0;
					sheet.current.col = 0;
					sheet.move.event();
					editHistory.clear();
					sheet.edit.history();
				},
			});
		},
	});
};

export { bindNewSheet };
