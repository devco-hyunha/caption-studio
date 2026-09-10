import { clone } from '../../utils/object.js';
import { EMPTY_TIMELINE } from '../constants.js';
import { createUniqueSheetName, normalizeTabName } from './names.js';

/**
 * @returns {{ name: string, timelines: object[], scroll: number, current: object, selectedRows: number[] }}
 */
const createEmptySheetDoc = (name = 'sheet1') => ({
	name: normalizeTabName(name),
	timelines: [clone(EMPTY_TIMELINE)],
	smiName: '',
	smiLang: '',
	scroll: 0,
	current: {},
	selectedRows: [],
});

/**
 * @param {object} sheetDoc
 * @returns {object}
 */
const normalizeSheetDoc = (sheetDoc) => {
	const name = normalizeTabName(sheetDoc?.name);
	const timelines = Array.isArray(sheetDoc?.timelines) && sheetDoc.timelines.length > 0
		? sheetDoc.timelines
		: [clone(EMPTY_TIMELINE)];
	return {
		name,
		timelines,
		smiName: typeof sheetDoc?.smiName === 'string' ? sheetDoc.smiName : '',
		smiLang: typeof sheetDoc?.smiLang === 'string' ? sheetDoc.smiLang : '',
		scroll: typeof sheetDoc?.scroll === 'number' ? sheetDoc.scroll : 0,
		current: sheetDoc?.current && typeof sheetDoc.current === 'object'
			? sheetDoc.current
			: {},
		selectedRows: Array.isArray(sheetDoc?.selectedRows) ? sheetDoc.selectedRows : [],
	};
};

/**
 * 구 `Timeline[]` 및 신 스키마를 `{ version, active, sheets }`로 통일한다.
 *
 * @param {unknown} raw
 * @returns {{ version: 1, active: number, sheets: object[] }}
 */
const normalizeSubtitleTemp = (raw) => {
	if (Array.isArray(raw)) {
		const timelines = raw.length > 0 ? raw : [clone(EMPTY_TIMELINE)];
		return {
			version: 1,
			active: 0,
			sheets: [normalizeSheetDoc({ name: 'sheet1', timelines })],
		};
	}

	if (raw && typeof raw === 'object' && Array.isArray(raw.sheets) && raw.sheets.length > 0) {
		const sheets = raw.sheets.map((doc) => normalizeSheetDoc(doc));
		const names = [];
		sheets.forEach((doc) => {
			if (names.includes(doc.name)) {
				doc.name = createUniqueSheetName(names);
			}
			names.push(doc.name);
		});
		let active = typeof raw.active === 'number' ? raw.active : 0;
		if (active < 0 || active >= sheets.length) active = 0;
		return { version: 1, active, sheets };
	}

	return {
		version: 1,
		active: 0,
		sheets: [createEmptySheetDoc('sheet1')],
	};
};

/**
 * @param {{ sheets: object[], activeSheetIndex: number }} sheet
 * @returns {{ version: 1, active: number, sheets: { name: string, timelines: object[], smiName: string, smiLang: string }[] }}
 */
const serializeSubtitleTemp = (sheet) => ({
	version: 1,
	active: sheet.activeSheetIndex,
	sheets: sheet.sheets.map((doc) => ({
		name: doc.name,
		timelines: doc.timelines,
		smiName: doc.smiName || '',
		smiLang: doc.smiLang || '',
	})),
});

export {
	createEmptySheetDoc,
	normalizeSheetDoc,
	normalizeSubtitleTemp,
	serializeSubtitleTemp,
};
