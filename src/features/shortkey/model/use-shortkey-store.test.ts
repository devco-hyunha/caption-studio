import { beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_SHEET_SHORTKEY_MASKS,
	SHORTKEY_IDS,
	SHORTKEY_MASKS,
} from './default-sheet-shortkey-masks';
import { STORAGE_KEY_SHORTKEY } from './shortkey-storage';
import { useShortkeyStore } from './use-shortkey-store';

const readPersisted = () => {
	const raw = localStorage.getItem(STORAGE_KEY_SHORTKEY);
	return raw ? (JSON.parse(raw) as { state: { masks: Record<string, string> } }).state.masks : null;
};

describe('useShortkeyStore', () => {
	beforeEach(() => {
		localStorage.clear();
		useShortkeyStore.getState().resetMasks();
	});

	it('starts with default sheet shortkey masks', () => {
		expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_SHORTKEY_MASKS);
	});

	it('setMask updates one id with normalized mask', () => {
		useShortkeyStore.getState().setMask(SHORTKEY_IDS.NEXT_ROW_MOVE, 'Ctrl + Tab');
		expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.NEXT_ROW_MOVE]).toBe('ctrl+tab');
		expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.PREV_ROW_MOVE]).toBe(
			SHORTKEY_MASKS.SHIFT_TAB,
		);
	});

	it('persists only changed masks', () => {
		useShortkeyStore.getState().setMask(SHORTKEY_IDS.SHEET_INSERT, 'Ctrl + Shift + K');
		expect(readPersisted()).toEqual({ [SHORTKEY_IDS.SHEET_INSERT]: 'ctrl+shift+k' });
	});

	it('promotes legacy customkey-* storage on merge', () => {
		localStorage.setItem('customkey-sheet-insert', JSON.stringify('ctrl+shift+k'));
		useShortkeyStore.persist.rehydrate();
		expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.SHEET_INSERT]).toBe('ctrl+shift+k');
	});

	it('resetMasks restores defaults and clears persisted changes', () => {
		useShortkeyStore.getState().setMask(SHORTKEY_IDS.SHEET_REMOVE, 'ctrl+shift+x');
		useShortkeyStore.getState().resetMasks();
		expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_SHORTKEY_MASKS);
		expect(readPersisted()).toEqual({});
	});
});
