import { storage } from '../utils/storage.js';

const AUTO_SAVE_DELAY_MS = 400;

/**
 * timelines를 `SUBTITLE_TEMP`에 디바운스 저장하는 함수를 만든다.
 *
 * @param {object} sheet
 * @returns {() => void}
 */
const createAutoSave = (sheet) => {
	let timer = null;

	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			storage.set('SUBTITLE_TEMP', sheet.timelines);
		}, AUTO_SAVE_DELAY_MS);
	};
};

export { createAutoSave };
