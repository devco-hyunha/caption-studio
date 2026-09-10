import { storage } from '../../utils/storage.js';
import { editHistory } from '../../utils/index.js';
import { normalizeSubtitleTemp, serializeSubtitleTemp } from './normalizeTemp.js';
import { STORAGE_KEY_LEGACY_TEMP, STORAGE_KEY_SHEETS } from './storageKeys.js';

/**
 * storage.get이 깨진 JSON 등에서 throw하지 않도록 감싼다.
 *
 * @param {string} key
 * @returns {unknown}
 */
const readStorage = (key) => {
	try {
		return storage.get(key);
	} catch {
		return null;
	}
};

/**
 * @param {unknown} value
 * @returns {boolean}
 */
const hasStoredValue = (value) => value != null && value !== '';

/**
 * `subtitleSheets`를 읽고, 없으면 레거시 `SUBTITLE_TEMP`에서 승격한다.
 * 쓰기는 `subtitleSheets`에만 한다.
 *
 * @param {object} sheet
 * @returns {boolean} 이번 호출에서 로드했으면 true
 */
const ensureSheetsLoaded = (sheet) => {
	if (sheet.sheets.length > 0) return false;

	const fromNew = readStorage(STORAGE_KEY_SHEETS);
	const raw = hasStoredValue(fromNew)
		? fromNew
		: readStorage(STORAGE_KEY_LEGACY_TEMP);

	const normalized = normalizeSubtitleTemp(raw);
	sheet.sheets = normalized.sheets;
	sheet.activeSheetIndex = normalized.active;
	editHistory.resetForSheets(sheet.sheets.length, sheet.activeSheetIndex);
	storage.set(STORAGE_KEY_SHEETS, serializeSubtitleTemp(sheet));
	return true;
};

export { ensureSheetsLoaded, readStorage };
