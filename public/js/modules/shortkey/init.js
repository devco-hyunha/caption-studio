import { storage } from '../utils/storage.js';
import { normalizeMask } from './shortcuts.js';

/** 단축키 맵 키 변경 시 이전 storage 키 호환 */
const LEGACY_CUSTOM_KEY_IDS = {
	colorClear: 'color_clear',
};

/**
 * 단축키 등록·런타임 바인딩·설정 UI API를 만든다.
 *
 * - `registerKeys` — default/custom 키를 Shortcuts에 등록 (재호출 가능)
 * - `mount` — 최초: 등록 + callback/start(1회) + 설정 UI
 *
 * @param {{ shortkey: object, sheet: object, ui: object }} deps
 * @returns {{ mount: () => void, registerKeys: () => void }}
 */
const createMount = ({ shortkey, sheet, ui }) => {
	let isRuntimeBound = false;

	const registerKeys = () => {
		shortkey.defaultKeys.forEach((keyEntry) => {
			shortkey.add(keyEntry);
		});

		Object.entries(shortkey.customKeys).forEach(([keyId, keyEntry]) => {
			const legacyId = LEGACY_CUSTOM_KEY_IDS[keyId];
			const savedMask = storage.get(`customkey-${keyId}`)
				?? (legacyId ? storage.get(`customkey-${legacyId}`) : null);
			if (savedMask) keyEntry.mask = normalizeMask(savedMask);
			shortkey.add(keyEntry);
		});
	};

	const bindRuntime = () => {
		if (isRuntimeBound) return;

		shortkey.callback((event) => {
			const isPrintable = event.key.length === 1 || event.code === 'Space';

			if (
				!ui.layer
				&& !document.querySelector('.dialog.on')
				&& !sheet.edit.state
				&& !sheet.multiple.state
				&& sheet.isTextTarget
				&& !event.ctrlKey
				&& !event.altKey
				&& !event.isComposing
				&& isPrintable
			) {
				sheet.edit.on();
			}
		});
		shortkey.start();
		isRuntimeBound = true;
	};

	const mount = () => {
		registerKeys();
		bindRuntime();
		shortkey.renderSettings();
	};

	return { mount, registerKeys };
};

export { createMount };
