import { createFormat } from './format.js';
import { createLanguage } from './language.js';

/**
 * @typedef {Object} SettingsContext
 * @property {object} ui
 * @property {object} sheet
 * @property {object} subtitle
 * @property {object} i18n
 */

/**
 * 앱 설정(포맷·언어) 액션 객체를 생성한다.
 *
 * @param {SettingsContext} context
 * @returns {{ format: (format: string) => void, language: (language: string) => void }}
 */
const createSettings = (context) => ({
	format: createFormat(context),
	language: createLanguage(context),
});

export default createSettings;
