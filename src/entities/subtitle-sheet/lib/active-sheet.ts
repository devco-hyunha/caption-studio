/** 활성 시트 다중 선택 / 행 CRUD 래퍼 — SheetsState 변경은 entities 책임 */
import type { Sheet, SheetTimelineFormat, SheetsState } from '../types';
import {
	enterMultipleSelection,
	exitMultipleSelection,
	toggleSelectedRow,
} from './selection/sheet-selection';
import { insertTimelineAfter, removeTimelineAt } from './mutate/rows-mutate';

/** 활성 시트만 patch. patch가 같은 시트를 돌려주면 변경 없음(null) */
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

export {
	patchActiveSheet,
	toggleMultiple,
	toggleActiveSelectedRow,
	setActiveMultipleStart,
	insertActiveTimelineAfter,
	removeActiveTimelineAt,
};
