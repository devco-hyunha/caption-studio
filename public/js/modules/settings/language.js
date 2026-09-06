import { storage } from '../utils/index.js';

/**
 * UI 언어 변경 핸들러를 만든다.
 *
 * @param {{ ui: object, sheet: object, subtitle: object, i18n: object }} context
 * @returns {(language: string) => void}
 */
const createLanguage = ({ ui, sheet, subtitle, i18n }) => (language) => {
	i18n.setLanguage(language);
	storage.set('language', language);
	sheet.set({
		language,
		Header: subtitle.header[sheet.format],
	});
	ui.applyI18n();
	document.querySelectorAll('.nav-open').forEach((node) => {
		node.classList.remove('nav-open');
	});
};

export { createLanguage };
