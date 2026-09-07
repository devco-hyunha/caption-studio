import ko from './kr.js';
import en from './en.js';
import ja from './jp.js';
import { migrateLanguage } from './migrateLanguage.js';

const i18n = () => {
	const locales = {
		ko, en, ja,
	};

	let currentLanguage = 'ko';

	const getLanguage = () => currentLanguage;

	const setLanguage = (lang) => {
		const next = migrateLanguage(lang);
		if (locales[next]) currentLanguage = next;
		return currentLanguage;
	};

	const getLocale = (lang = currentLanguage) => locales[lang];

	const t = (key, lang = currentLanguage) => {
		const locale = getLocale(lang);
		return locale?.[key] || key;
	};

	return {
		getLanguage,
		setLanguage,
		getLocale,
		t,
	};
};
export default i18n;
