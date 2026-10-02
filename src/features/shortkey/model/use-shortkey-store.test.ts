import { describe, expect, it } from 'vitest';
import { DEFAULT_SHEET_KEY_MASKS } from './default-sheet-key-masks';
import { useShortkeyStore } from './use-shortkey-store';

describe('useShortkeyStore', () => {
	it('starts with default sheet key masks', () => {
		useShortkeyStore.getState().resetMasks();
		expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_KEY_MASKS);
	});

	it('setMask updates one id with normalized mask', () => {
		useShortkeyStore.getState().resetMasks();
		useShortkeyStore.getState().setMask('nextRowMove', 'Ctrl + Tab');
		expect(useShortkeyStore.getState().masks.nextRowMove).toBe('ctrl+tab');
		expect(useShortkeyStore.getState().masks.prevRowMove).toBe(
			DEFAULT_SHEET_KEY_MASKS.prevRowMove,
		);
		useShortkeyStore.getState().resetMasks();
	});
});
