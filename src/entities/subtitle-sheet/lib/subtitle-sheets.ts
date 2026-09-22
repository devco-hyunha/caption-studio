import type {
	SavedState,
	Sheet,
	SheetTimelineItem,
	EditableColumn,
	SheetsState,
} from '../types';
import { parseTimecode } from '@/shared/lib/timecode';
import {
	createCopyName,
	createTabName,
	isValidTabName,
	normalizeTabName,
} from './tab-names';

const STORAGE_KEY_SHEETS = 'subtitleSheets';
const STORAGE_KEY_TEMP = 'SUBTITLE_TEMP';
const AUTO_SAVE_DELAY_MS = 400;

const EMPTY_TIMELINE: SheetTimelineItem = Object.freeze({
	start: 0,
	end: 0,
	text: '',
	memo: '',
});

const cloneTimeline = (timeline: SheetTimelineItem = EMPTY_TIMELINE): SheetTimelineItem => ({
	start: timeline.start,
	end: timeline.end,
	sync: timeline.sync,
	text: timeline.text,
	memo: timeline.memo,
});

const createSheet = (name = 'sheet1'): Sheet => ({
	name: normalizeTabName(name),
	timelines: [cloneTimeline()],
	smiName: '',
	smiLang: '',
	scroll: 0,
	current: {},
	selectedRows: [],
});

const normalizeSheet = (sheet: Partial<Sheet> | null | undefined): Sheet => {
	const timelines =
		Array.isArray(sheet?.timelines) && sheet.timelines.length > 0
			? sheet.timelines.map((timeline) => cloneTimeline(timeline))
			: [cloneTimeline()];

	return {
		name: normalizeTabName(sheet?.name),
		timelines,
		smiName: typeof sheet?.smiName === 'string' ? sheet.smiName : '',
		smiLang: typeof sheet?.smiLang === 'string' ? sheet.smiLang : '',
		scroll: typeof sheet?.scroll === 'number' ? sheet.scroll : 0,
		current: sheet?.current && typeof sheet.current === 'object' ? { ...sheet.current } : {},
		selectedRows: Array.isArray(sheet?.selectedRows) ? [...sheet.selectedRows] : [],
	};
};

/** 구 Timeline[] 및 신 스키마를 `{ active, sheets }`로 통일. 옛 JSON의 `version`은 무시 */
const normalizeState = (raw: unknown): SheetsState => {
	if (Array.isArray(raw)) {
		const timelines =
			raw.length > 0
				? raw.map((item) => cloneTimeline(item as SheetTimelineItem))
				: [cloneTimeline()];
		return {
			active: 0,
			sheets: [normalizeSheet({ name: 'sheet1', timelines })],
		};
	}

	if (raw && typeof raw === 'object' && Array.isArray((raw as SheetsState).sheets)) {
		const source = raw as Partial<SheetsState>;
		if (!source.sheets || source.sheets.length === 0) {
			return { active: 0, sheets: [createSheet('sheet1')] };
		}

		const sheets = source.sheets.map((sheet) => normalizeSheet(sheet));
		const names: string[] = [];
		sheets.forEach((sheet) => {
			if (names.includes(sheet.name)) {
				sheet.name = createTabName(names);
			}
			names.push(sheet.name);
		});

		let active = typeof source.active === 'number' ? source.active : 0;
		if (active < 0 || active >= sheets.length) active = 0;

		return { active, sheets };
	}

	return {
		active: 0,
		sheets: [createSheet('sheet1')],
	};
};

/** scroll/current/selectedRows 제외해 저장용 JSON으로 직렬화 */
const serializeForSave = (state: SheetsState): SavedState => ({
	active: state.active,
	sheets: state.sheets.map((sheet) => ({
		name: sheet.name,
		timelines: sheet.timelines,
		smiName: sheet.smiName || '',
		smiLang: sheet.smiLang || '',
	})),
});

const toSaveState = (state: SheetsState): SheetsState => {
	const disk = serializeForSave(state);
	return normalizeState(disk);
};

const readStorageJson = (key: string): unknown => {
	if (typeof window === 'undefined') return null;

	try {
		const raw = window.localStorage.getItem(key);
		if (raw == null || raw === '') return null;
		return JSON.parse(raw) as unknown;
	} catch {
		return null;
	}
};

const hasStoredValue = (value: unknown) => value != null && value !== '';

const saveState = (state: SheetsState) => {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(serializeForSave(state)));
	} catch {
		// quota / private mode — 무시
	}
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const debounceSaveState = (state: SheetsState) => {
	if (typeof window === 'undefined') return;

	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		debounceTimer = null;
		saveState(state);
	}, AUTO_SAVE_DELAY_MS);
};

/** `subtitleSheets` 로드. 없으면 `SUBTITLE_TEMP` 승격 후 저장 */
const loadState = (): SheetsState => {
	const fromNew = readStorageJson(STORAGE_KEY_SHEETS);
	const raw = hasStoredValue(fromNew) ? fromNew : readStorageJson(STORAGE_KEY_TEMP);
	const normalized = normalizeState(raw);

	if (!hasStoredValue(fromNew) && hasStoredValue(raw)) {
		saveState(normalized);
	}

	return normalized;
};

const cloneSheet = (sheet: Sheet, name: string): Sheet => ({
	name: normalizeTabName(name),
	timelines: sheet.timelines.map((timeline) => cloneTimeline(timeline)),
	smiName: sheet.smiName,
	smiLang: sheet.smiLang,
	scroll: 0,
	current: {},
	selectedRows: [],
});

const selectSheet = (state: SheetsState, index: number): SheetsState => {
	if (index < 0 || index >= state.sheets.length) return state;
	if (index === state.active) return state;
	return { ...state, active: index };
};

/** 활성(또는 지정) 시트의 scroll 저장 */
const updateSheetScroll = (
	state: SheetsState,
	index: number,
	scrollTop: number,
): SheetsState => {
	const sheet = state.sheets[index];
	if (!sheet) return state;

	const nextScroll = Math.max(0, scrollTop);
	if (sheet.scroll === nextScroll) return state;

	return {
		...state,
		sheets: [
			...state.sheets.slice(0, index),
			{ ...sheet, scroll: nextScroll },
			...state.sheets.slice(index + 1),
		],
	};
};

const getActiveScroll = (state: SheetsState) =>
	Math.max(0, state.sheets[state.active]?.scroll ?? 0);

const addSheet = (state: SheetsState): SheetsState => {
	const name = createTabName(state.sheets.map((sheet) => sheet.name));
	const sheets = [...state.sheets, createSheet(name)];
	return { ...state, sheets, active: sheets.length - 1 };
};

const deleteSheet = (state: SheetsState, index: number): SheetsState => {
	if (state.sheets.length <= 1) return state;
	if (index < 0 || index >= state.sheets.length) return state;

	const sheets = state.sheets.filter((_, sheetIndex) => sheetIndex !== index);
	let active = state.active;
	if (index < active) active -= 1;
	else if (index === active) active = Math.min(active, sheets.length - 1);

	return { ...state, sheets, active };
};

const renameSheet = (
	state: SheetsState,
	index: number,
	name: string,
): SheetsState | null => {
	const trimmed = name.trim();
	if (!isValidTabName(trimmed)) return null;
	if (state.sheets.some((sheet, sheetIndex) => sheetIndex !== index && sheet.name === trimmed)) {
		return null;
	}
	if (!state.sheets[index]) return null;

	const sheet = state.sheets[index];
	return {
		...state,
		sheets: [
			...state.sheets.slice(0, index),
			{ ...sheet, name: trimmed },
			...state.sheets.slice(index + 1),
		],
	};
};

const copySheet = (state: SheetsState, index: number): SheetsState => {
	const source = state.sheets[index];
	if (!source) return state;

	const name = createCopyName(
		source.name,
		state.sheets.map((sheet) => sheet.name),
	);
	const sheets = [...state.sheets];
	sheets.splice(index + 1, 0, cloneSheet(source, name));
	return { ...state, sheets, active: index + 1 };
};

/** 활성 시트 타임라인 셀 값 갱신 */
const updateActiveCell = (
	state: SheetsState,
	rowIndex: number,
	column: EditableColumn,
	value: string,
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet) return null;
	const timeline = sheet.timelines[rowIndex];
	if (!timeline) return null;

	const nextTimeline = cloneTimeline(timeline);

	if (column === 'text') {
		nextTimeline.text = value;
	} else if (column === 'memo') {
		nextTimeline.memo = value;
	} else if (column === 'starttime') {
		const parsed = parseTimecode(value);
		if (parsed == null) return null;
		nextTimeline.start = parsed;
	} else if (column === 'endtime') {
		const parsed = parseTimecode(value);
		if (parsed == null) return null;
		nextTimeline.end = parsed;
	} else {
		return null;
	}

	const timelines = [
		...sheet.timelines.slice(0, rowIndex),
		nextTimeline,
		...sheet.timelines.slice(rowIndex + 1),
	];
	const active = state.active;

	return {
		...state,
		sheets: [
			...state.sheets.slice(0, active),
			{ ...sheet, timelines },
			...state.sheets.slice(active + 1),
		],
	};
};

const createState = (): SheetsState => normalizeState(null);

export {
	STORAGE_KEY_TEMP,
	STORAGE_KEY_SHEETS,
	addSheet,
	copySheet,
	createSheet,
	createState,
	deleteSheet,
	getActiveScroll,
	loadState,
	normalizeState,
	toSaveState,
	renameSheet,
	debounceSaveState,
	selectSheet,
	serializeForSave,
	updateActiveCell,
	updateSheetScroll,
	saveState,
};
