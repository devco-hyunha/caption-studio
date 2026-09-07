const LEGACY_LANGUAGE_MAP = {
	KRCC: 'ko',
	ENCC: 'en',
	JPCC: 'ja',
};

const LOCALES = new Set(['ko', 'en', 'ja']);

/** UI 로케일 → SMI STYLE lang (BCP-47) */
const LOCALE_TO_SMI_LANG = {
	ko: 'ko-KR',
	en: 'en-US',
	ja: 'ja-JP',
};

/** UI 로케일 (신) */
const STORAGE_KEY_LOCALE = 'locale';

/** 레거시 UI 언어 키 — 읽기 전용 승격 소스. 쓰지 않음. */
const STORAGE_KEY_LEGACY_LANGUAGE = 'language';

/**
 * 구 `KRCC`/`ENCC`/`JPCC` 및 신 `ko`/`en`/`ja`를 UI 로케일 코드로 통일한다.
 *
 * @param {unknown} raw
 * @returns {'ko'|'en'|'ja'}
 */
const migrateLanguage = (raw) => {
	if (typeof raw !== 'string' || raw === '') return 'ko';
	if (LOCALES.has(raw)) return raw;
	if (LEGACY_LANGUAGE_MAP[raw]) return LEGACY_LANGUAGE_MAP[raw];
	return 'ko';
};

/**
 * `locale`을 읽고, 없으면 레거시 `language`에서 승격한다. 쓰기는 `locale`만.
 *
 * @param {{ get: (key: string) => unknown, set: (key: string, value: unknown) => void }} storage
 * @returns {'ko'|'en'|'ja'}
 */
const loadLocale = (storage) => {
	let raw = null;
	try {
		raw = storage.get(STORAGE_KEY_LOCALE);
	} catch {
		raw = null;
	}
	if (raw == null || raw === '') {
		try {
			raw = storage.get(STORAGE_KEY_LEGACY_LANGUAGE);
		} catch {
			raw = null;
		}
	}
	const locale = migrateLanguage(raw);
	storage.set(STORAGE_KEY_LOCALE, locale);
	return locale;
};

/**
 * @param {{ set: (key: string, value: unknown) => void }} storage
 * @param {string} language
 * @returns {'ko'|'en'|'ja'}
 */
const saveLocale = (storage, language) => {
	const locale = migrateLanguage(language);
	storage.set(STORAGE_KEY_LOCALE, locale);
	return locale;
};

/**
 * @param {string} [locale]
 * @returns {string}
 */
const localeToSmiLang = (locale) =>
	LOCALE_TO_SMI_LANG[migrateLanguage(locale)] ?? 'ko-KR';

export {
	migrateLanguage,
	loadLocale,
	saveLocale,
	localeToSmiLang,
	LEGACY_LANGUAGE_MAP,
	LOCALE_TO_SMI_LANG,
	STORAGE_KEY_LOCALE,
	STORAGE_KEY_LEGACY_LANGUAGE,
};
