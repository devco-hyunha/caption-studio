import KRCC from './kr.js';
import ENCC from './en.js';
import JPCC from './jp.js';

const i18n = () => {
	const locales = {
		KRCC, ENCC, JPCC
	};
	
	let currentLanguage = 'KRCC';
	
	const getLanguage = () => currentLanguage;
	
	const setLanguage = (lang) => {
		if (locales[lang]) currentLanguage = lang;
		return currentLanguage;
	}

	const getLocale = (lang = currentLanguage) => locales[lang];

	const t = (key, lang = currentLanguage) => {
		const locale = getLocale(lang);
		return locale?.[key] || key;
	};

	return {
		getLanguage,
		setLanguage,
		getLocale,
		t
	};
};
export default i18n;