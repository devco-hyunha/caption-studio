import { header } from './header.js';
import { encode } from './encode.js';
import converters from './convert/index.js';
import exportHandlers from './export/exportHandlers.js';
import importHandlers from './importHandlers.js';

/**
 * @typedef {Object} SubtitleContext
 * @property {object} ui
 * @property {object} sheet
 * @property {object} i18n
 */

/**
 * subtitle 도메인 객체를 생성한다.
 *
 * @param {SubtitleContext} context
 * @returns {{
 *   header: object,
 *   encode: Function,
 *   converters: { srt: Function, smi: Function },
 *   import: Record<string, () => void>,
 *   export: Record<string, () => void>,
 * }}
 */
const createSubtitle = (context) => ({
	header,
	encode,
	converters,
	import: importHandlers(context),
	export: exportHandlers(context),
});

export default createSubtitle;
