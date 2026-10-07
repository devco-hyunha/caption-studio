import type {
	SavedState,
	Sheet,
	SheetTimelineFormat,
	SheetTimelineItem,
	EditableColumn,
	SheetsState,
} from '../types';
import { parseTimecode } from '@/shared/lib/timecode';
import {
	enterMultipleSelection,
	exitMultipleSelection,
	toggleSelectedRow,
} from './sheet-selection';
import {
	insertTimelineAfter,
	removeTimelineAt,
	replaceTimelineAt,
	spliceTimelineAt,
} from './sheet-mutate';
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
	multipleActive: false,
	multipleStart: null,
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
		multipleActive: sheet?.multipleActive === true,
		multipleStart:
			typeof sheet?.multipleStart === 'number' ? sheet.multipleStart : null,
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
	multipleActive: false,
	multipleStart: null,
});

const patchActiveSheet = (
	state: SheetsState,
	patch: (sheet: Sheet) => Sheet | null,
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet) return null;
	const nextSheet = patch(sheet);
	if (!nextSheet || nextSheet === sheet) return null;
	return {
		...state,
		sheets: [
			...state.sheets.slice(0, state.active),
			nextSheet,
			...state.sheets.slice(state.active + 1),
		],
	};
};

/** multiple 모드 on/off */
const toggleMultiple = (state: SheetsState, currentRow: number): SheetsState => {
	const sheet = state.sheets[state.active];
	if (!sheet) return state;

	const nextSelection = sheet.multipleActive
		? exitMultipleSelection()
		: enterMultipleSelection(Math.max(0, currentRow));

	const next = patchActiveSheet(state, (active) => ({
		...active,
		...nextSelection,
	}));
	return next ?? state;
};

/** Space / Shift 범위. multiple 아니면 no-op */
const toggleActiveSelectedRow = (
	state: SheetsState,
	row: number,
	withShift: boolean,
): SheetsState => {
	const sheet = state.sheets[state.active];
	if (!sheet?.multipleActive) return state;

	const nextSelection = toggleSelectedRow(
		{ selectedRows: sheet.selectedRows, multipleStart: sheet.multipleStart },
		row,
		withShift,
	);
	const next = patchActiveSheet(state, (active) => ({
		...active,
		selectedRows: nextSelection.selectedRows,
		multipleStart: nextSelection.multipleStart,
	}));
	return next ?? state;
};

/** multiple 이동(비-Shift) 앵커 */
const setActiveMultipleStart = (state: SheetsState, row: number): SheetsState => {
	const sheet = state.sheets[state.active];
	if (!sheet?.multipleActive) return state;
	if (sheet.multipleStart === row) return state;
	const next = patchActiveSheet(state, (active) => ({
		...active,
		multipleStart: row,
	}));
	return next ?? state;
};

/**
 * 행 삽입. multiple 중이면 null.
 * 성공 시 `{ state, insertIndex }`.
 */
const insertActiveTimelineAfter = (
	state: SheetsState,
	row: number,
	format: SheetTimelineFormat,
): { state: SheetsState; insertIndex: number } | null => {
	const sheet = state.sheets[state.active];
	if (!sheet || sheet.multipleActive) return null;

	const { timelines, insertIndex } = insertTimelineAfter(sheet.timelines, row, format);
	const next = patchActiveSheet(state, (active) => ({
		...active,
		timelines,
		selectedRows: [],
		multipleStart: null,
	}));
	if (!next) return null;
	return { state: next, insertIndex };
};

/**
 * 행 삭제. multiple 중이면 null.
 * 성공 시 `{ state, focusRow }`.
 */
const removeActiveTimelineAt = (
	state: SheetsState,
	row: number,
): { state: SheetsState; focusRow: number } | null => {
	const sheet = state.sheets[state.active];
	if (!sheet || sheet.multipleActive) return null;

	const result = removeTimelineAt(sheet.timelines, row);
	if (!result) return null;

	const next = patchActiveSheet(state, (active) => ({
		...active,
		timelines: result.timelines,
		selectedRows: [],
		multipleStart: null,
	}));
	if (!next) return null;
	return { state: next, focusRow: result.focusRow };
};

/**
 * multiple 선택 행의 text에 transform 적용.
 * multiple이 아니거나 선택 없으면 null.
 */
const updateSelectedRowTexts = (
	state: SheetsState,
	transform: (text: string, rowIndex: number) => string,
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet?.multipleActive) return null;
	if (sheet.selectedRows.length === 0) return null;

	let changed = false;
	const timelines = sheet.timelines.map((timeline, index) => {
		if (!sheet.selectedRows.includes(index)) return timeline;
		const prev = typeof timeline.text === 'string' ? timeline.text : '';
		const nextText = transform(prev, index);
		if (nextText === prev) return timeline;
		changed = true;
		return { ...timeline, text: nextText };
	});

	if (!changed) return null;

	return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/** undo/redo — 활성 시트 한 행 교체 */
const replaceActiveTimelineAt = (
	state: SheetsState,
	row: number,
	data: SheetTimelineItem,
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet) return null;
	const timelines = replaceTimelineAt(sheet.timelines, row, data);
	if (!timelines) return null;
	return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/** undo/redo — 인덱스에 행 삽입 (시각 자동 채움 없음) */
const spliceActiveTimelineAt = (
	state: SheetsState,
	index: number,
	data: SheetTimelineItem,
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet) return null;
	const timelines = spliceTimelineAt(sheet.timelines, index, data);
	return patchActiveSheet(state, (active) => ({
		...active,
		timelines,
		selectedRows: [],
		multipleStart: null,
	}));
};

/** undo/redo — multi 패치 일괄 적용 */
const replaceActiveTimelinePatches = (
	state: SheetsState,
	patches: readonly { index: number; data: SheetTimelineItem }[],
): SheetsState | null => {
	const sheet = state.sheets[state.active];
	if (!sheet || patches.length === 0) return null;

	let timelines = sheet.timelines;
	let changed = false;
	for (const patch of patches) {
		const next = replaceTimelineAt(timelines, patch.index, patch.data);
		if (!next) continue;
		timelines = next;
		changed = true;
	}
	if (!changed) return null;
	return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

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
	insertActiveTimelineAfter,
	loadState,
	normalizeState,
	toSaveState,
	removeActiveTimelineAt,
	renameSheet,
	replaceActiveTimelineAt,
	replaceActiveTimelinePatches,
	debounceSaveState,
	selectSheet,
	serializeForSave,
	setActiveMultipleStart,
	spliceActiveTimelineAt,
	toggleActiveSelectedRow,
	toggleMultiple,
	updateActiveCell,
	updateSelectedRowTexts,
	updateSheetScroll,
	saveState,
};
