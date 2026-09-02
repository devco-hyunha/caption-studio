import { header } from './header.js';
import { encode } from './encode.js';
import converters from './convert/index.js';
import exportHandlers from './export/exportHandlers.js';
import importHandlers from './importHandlers.js';

/**
 * @typedef {Object} SubtitleInitDeps
 * @property {object} Interface - caption.js UI 셸
 * @property {object} Sheet - 시트 API
 * @property {object} i18n - i18n 모듈 (import 핸들러에서 사용)
 */

/**
 * subtitle 도메인 모듈을 생성한다. `initialize()` 호출 전까지 `import`/`export`는 없다.
 *
 * @returns {{
 *   header: object,
 *   encode: Function,
 *   converters: { srt: Function, smi: Function },
 *   initialize: (deps: SubtitleInitDeps) => void,
 *   import?: Record<string, () => void>,
 *   export?: Record<string, () => void>,
 * }}
 */
const subtitleModule = () => {
	const module = {
		header,
		encode,
		converters,
	};

	/**
	 * import/export 핸들러를 주입한다. `Do.on('ready')`에서 Sheet·Interface 준비 후 호출한다.
	 *
	 * @param {SubtitleInitDeps} deps
	 */
	module.initialize = ({ Interface, Sheet, i18n }) => {
		module.import = importHandlers({ Interface, Sheet, i18n });
		module.export = exportHandlers({ Interface, Sheet });
	};

	return module;
};

export default subtitleModule;
