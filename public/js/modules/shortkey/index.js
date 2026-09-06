import { createShortcuts } from './shortcuts.js';
import { createDefaultKeys } from './defaultKeys.js';
import { createCustomKeys } from './customKeys.js';
import { convert } from './convert.js';
import { createRenderSettings } from './renderSettings.js';
import { createMount } from './init.js';

/**
 * @typedef {Object} ShortkeyConfigureDeps
 * @property {object} ui
 * @property {object} sheet
 * @property {object} video
 * @property {{ t: (key: string) => string }} i18n
 */

/**
 * Shortkey 도메인 모듈. 바닐라 Shortcuts에 defaultKeys·customKeys·convert·renderSettings·mount·registerKeys를 붙인다.
 * `configure()` 호출 전까지 단축키 정의 API는 없다.
 *
 * @returns {object & { configure: (deps: ShortkeyConfigureDeps) => void }}
 */
const shortkeyModule = () => {
	const shortkey = createShortcuts();

	/**
	 * sheet·ui·video·i18n 주입 후 단축키 정의·설정 UI API를 조립한다.
	 *
	 * @param {ShortkeyConfigureDeps} deps
	 */
	shortkey.configure = ({ ui, sheet, video, i18n }) => {
		shortkey.defaultKeys = createDefaultKeys({ sheet, ui, video });
		shortkey.customKeys = createCustomKeys({ sheet, video });
		shortkey.convert = (event) => convert(event, shortkey.code);
		shortkey.renderSettings = createRenderSettings({ shortkey, ui, i18n });
		const { mount, registerKeys } = createMount({ shortkey, sheet, ui });
		shortkey.mount = mount;
		shortkey.registerKeys = registerKeys;
	};

	return shortkey;
};

export default shortkeyModule;
