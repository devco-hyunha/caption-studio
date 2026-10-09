import { afterEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_SHEET_FORMAT,
	STORAGE_KEY_FORMAT,
	readStoredSheetFormat,
	writeStoredSheetFormat,
} from './sheet-format-storage';

describe('sheet-format-storage', () => {
	afterEach(() => {
		window.localStorage.removeItem(STORAGE_KEY_FORMAT);
	});

	it('returns default when key is missing', () => {
		expect(readStoredSheetFormat()).toBe(DEFAULT_SHEET_FORMAT);
	});

	it('round-trips smi/srt with `/` storage JSON shape', () => {
		writeStoredSheetFormat('smi');
		expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY_FORMAT) ?? '')).toBe(
			'smi',
		);
		expect(readStoredSheetFormat()).toBe('smi');

		writeStoredSheetFormat('srt');
		expect(readStoredSheetFormat()).toBe('srt');
	});

	it('falls back on invalid stored values', () => {
		window.localStorage.setItem(STORAGE_KEY_FORMAT, '"vtt"');
		expect(readStoredSheetFormat()).toBe(DEFAULT_SHEET_FORMAT);

		window.localStorage.setItem(STORAGE_KEY_FORMAT, 'not-json');
		expect(readStoredSheetFormat()).toBe(DEFAULT_SHEET_FORMAT);
	});
});
