import type { EditableColumn, Sheet, SheetsState } from '../../types';
import { parseTimecode } from '@/shared/lib/timecode';
import { cloneTimeline, createSheet } from '../sheet-core';
import { createCopyName, createTabName, isValidTabName, normalizeTabName } from '../tab-names';

/** 시트 깊은 복사 — scroll/current/다중 선택은 초기화 */
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

/** 탭 선택 — 범위 밖·이미 선택된 탭이면 상태 유지 */
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

/** 시트 추가 — 빈 시트를 마지막에 추가하고 활성화 */
const addSheet = (state: SheetsState): SheetsState => {
	const name = createTabName(state.sheets.map((sheet) => sheet.name));
	const sheets = [...state.sheets, createSheet(name)];
	return { ...state, sheets, active: sheets.length - 1 };
};

/** 시트 삭제 — 마지막 시트는 삭제하지 않음. 활성 인덱스 보정 */
const deleteSheet = (state: SheetsState, index: number): SheetsState => {
	if (state.sheets.length <= 1) return state;
	if (index < 0 || index >= state.sheets.length) return state;

	const sheets = state.sheets.filter((_, sheetIndex) => sheetIndex !== index);
	let active = state.active;
	if (index < active) active -= 1;
	else if (index === active) active = Math.min(active, sheets.length - 1);

	return { ...state, sheets, active };
};

/** 시트 이름 변경 — 중복·불법 이름이면 null */
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

/** 시트 복사 — 원본 다음 위치에 복사본 삽입하고 활성화 */
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

export {
	addSheet,
	copySheet,
	deleteSheet,
	getActiveScroll,
	renameSheet,
	selectSheet,
	updateActiveCell,
	updateSheetScroll,
};
