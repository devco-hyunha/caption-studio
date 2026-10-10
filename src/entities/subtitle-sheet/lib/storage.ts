import type { StateStorage } from 'zustand/middleware';
import type { SavedState, SheetsState } from '../types';
import { normalizeState } from './sheet-core';

const STORAGE_KEY_SHEETS = 'subtitleSheets';
const STORAGE_KEY_TEMP = 'SUBTITLE_TEMP';
const AUTO_SAVE_DELAY_MS = 400;

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

/** 저장용 strip 후 normalize — 다중 선택/선택 행이 disk 상태에 남지 않음 */
const toSaveState = (state: SheetsState): SheetsState => {
	const disk = serializeForSave(state);
	return normalizeState(disk);
};

/** localStorage JSON 읽기 — 파싱 실패·SSR이면 null */
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

/** 저장된 값이 실제로 존재하는지 (null·빈 문자열 제외) */
const hasStoredValue = (value: unknown) => value != null && value !== '';

/** 즉시 저장 — quota·private mode 예외는 무시 */
const saveState = (state: SheetsState) => {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(serializeForSave(state)));
	} catch {
		// quota / private mode — 무시
	}
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** 자동 저장 — 400ms debounce로 연속 셀 edits를 한 번으로 합침 */
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

/** `subtitleSheets` 키·JSON — Zustand persist `{ state }` 래퍼 */
const createStorage = (): StateStorage => ({
	getItem: () => JSON.stringify({ state: loadState() }),
	setItem: (_name, value) => {
		try {
			const parsed = JSON.parse(value) as { state?: SheetsState };
			if (!parsed.state) return;
			// strip은 persist `partialize`에서 1회 (`use-sheet-store.ts`)
			// const partial = toSaveState(parsed.state);
			debounceSaveState(parsed.state);
		} catch {
			// ignore corrupt persist payload
		}
	},
	removeItem: () => {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.removeItem(STORAGE_KEY_SHEETS);
		} catch {
			// ignore
		}
	},
});

const mergeState = (
	persisted: unknown,
	current: SheetsState,
): SheetsState => {
	if (!persisted || typeof persisted !== 'object') return current;
	return normalizeState(persisted as SheetsState);
};

export {
	STORAGE_KEY_TEMP,
	STORAGE_KEY_SHEETS,
	createStorage,
	debounceSaveState,
	loadState,
	mergeState,
	saveState,
	toSaveState,
};
