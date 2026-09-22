import type { StateStorage } from 'zustand/middleware';
import type { SheetsState } from '../types';
import {
	STORAGE_KEY_SHEETS,
	loadState,
	normalizeState,
	debounceSaveState,
} from './subtitle-sheets';

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

export { createStorage, mergeState };
