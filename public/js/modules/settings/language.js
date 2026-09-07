import { storage } from '../utils/index.js';
import { saveLocale } from '../i18n/migrateLanguage.js';

/**
 * UI 언어 변경 핸들러를 만든다. (탭 · SMI Class와 무관)
 *
 * @param {{ ui: object, sheet: object, subtitle: object, i18n: object }} context
 * @returns {(language: string) => void}
 */
const createLanguage = ({ ui, sheet, i18n }) => (language) => {
	const next = saveLocale(storage, language);
	i18n.setLanguage(next);
	sheet.set({});
	ui.applyI18n();
	document.querySelectorAll('.nav-open').forEach((node) => {
		node.classList.remove('nav-open');
	});
};

export { createLanguage };
