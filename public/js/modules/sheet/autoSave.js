import { storage } from '../utils/storage.js';
import { serializeSubtitleTemp } from './tabs/normalizeTemp.js';
import { STORAGE_KEY_SHEETS } from './tabs/storageKeys.js';

const AUTO_SAVE_DELAY_MS = 400;

/**
 * sheets 문서를 `subtitleSheets`에 디바운스 저장하는 함수를 만든다.
 * 레거시 `SUBTITLE_TEMP`는 갱신하지 않는다.
 *
 * @param {object} sheet
 * @returns {() => void}
 */
const createAutoSave = (sheet) => {
	let timer = null;

	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			try {
				sheet.tabs?.persistActiveView?.();
				storage.set(STORAGE_KEY_SHEETS, serializeSubtitleTemp(sheet));
			} catch (error) {
				console.error('[sheet.autoSave]', error);
			}
		}, AUTO_SAVE_DELAY_MS);
	};
};

export { createAutoSave };
