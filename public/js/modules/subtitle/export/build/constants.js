/** UI locale → SMI Class (구 `sheet.language` 관례) */
const LOCALE_TO_SMI_CLASS = {
	ko: 'KRCC',
	en: 'ENCC',
	ja: 'JPCC',
};

/** Class별 STYLE 조각 (Name / lang / SAMIType) */
const SMI_CLASS_META = {
	KRCC: { name: 'Korean', lang: 'ko-KR' },
	ENCC: { name: 'English', lang: 'en-US' },
	JPCC: { name: 'Japanese', lang: 'ja-JP' },
};

/**
 * @param {string} classKey
 * @returns {string}
 */
const formatSmiClassStyle = (classKey) => {
	const meta = SMI_CLASS_META[classKey];
	if (!meta) return '';
	return `Name:${meta.name}; lang:${meta.lang}; SAMIType:CC;`;
};

/** SMI STYLE 프리셋. Class 키 → STYLE 본문 */
const SMI_CLASS = {
	KRCC: formatSmiClassStyle('KRCC'),
	ENCC: formatSmiClassStyle('ENCC'),
	JPCC: formatSmiClassStyle('JPCC'),
};

/**
 * @param {string} [locale] UI `ko` / `en` / `ja`
 * @returns {'KRCC'|'ENCC'|'JPCC'}
 */
const localeToSmiClassKey = (locale) =>
	LOCALE_TO_SMI_CLASS[locale] ?? 'KRCC';

export {
	SMI_CLASS,
	SMI_CLASS_META,
	LOCALE_TO_SMI_CLASS,
	localeToSmiClassKey,
	formatSmiClassStyle,
};
