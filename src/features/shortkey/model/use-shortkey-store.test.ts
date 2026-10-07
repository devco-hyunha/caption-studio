import { describe, expect, it } from 'vitest';
import {
	DEFAULT_SHEET_SHORTKEY_MASKS,
	SHORTKEY_IDS,
	SHORTKEY_MASKS,
} from './default-sheet-shortkey-masks';
import { useShortkeyStore } from './use-shortkey-store';

describe('useShortkeyStore', () => {
	it('starts with default sheet shortkey masks', () => {
		useShortkeyStore.getState().resetMasks();
		expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_SHORTKEY_MASKS);
	});

	it('setMask updates one id with normalized mask', () => {
		useShortkeyStore.getState().resetMasks();
		useShortkeyStore.getState().setMask(SHORTKEY_IDS.NEXT_ROW_MOVE, 'Ctrl + Tab');
		expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.NEXT_ROW_MOVE]).toBe('ctrl+tab');
		expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.PREV_ROW_MOVE]).toBe(
			SHORTKEY_MASKS.SHIFT_TAB,
		);
		useShortkeyStore.getState().resetMasks();
	});
});
