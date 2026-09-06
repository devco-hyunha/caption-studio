import { storage, editHistory } from '../utils/index.js';

/**
 * 자막 포맷 변경 핸들러를 만든다.
 *
 * @param {{ ui: object, sheet: object, subtitle: object, i18n: { t: (key: string) => string } }} context
 * @returns {(format: string) => void}
 */
const createFormat = ({ ui, sheet, subtitle, i18n }) => (format) => {
	if (format === sheet.format) return;

	ui.confirm({
		title: i18n.t('subtitle-format-change'),
		content: i18n.t('subtitle-format-change-contents'),
		bgDismiss: true,
		success: () => {
			storage.set('format', format);

			let optionArray = {};
			if (sheet.format !== format) {
				optionArray = subtitle.converters[format](sheet.format, sheet.timelines);
				optionArray.Header = subtitle.header[format];
			}

			sheet.set(optionArray);
			sheet.current.row = 0;
			sheet.current.col = 0;
			sheet.move.event();
			editHistory.clear();
			sheet.edit.history();
		},
		cancel: () => {
			ui.select({ key: 'format', value: sheet.format });
		},
	});
};

export { createFormat };
