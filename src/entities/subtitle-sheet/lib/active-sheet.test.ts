import { describe, expect, it } from 'vitest';
import type { SheetsState } from '../types';
import { updateActiveSelectedTexts } from './active-sheet';

const state = (overrides: Partial<SheetsState> = {}): SheetsState => ({
	active: 0,
	sheets: [
		{
			name: 'sheet1',
			timelines: [{ text: 'a' }, { text: 'b' }, { text: 'c' }],
			smiName: '',
			smiLang: '',
			scroll: 0,
			current: {},
			selectedRows: [0, 2],
			multipleActive: true,
			multipleStart: 0,
		},
	],
	...overrides,
});

describe('updateActiveSelectedTexts', () => {
	it('선택 행 text에만 transform 적용', () => {
		const next = updateActiveSelectedTexts(state(), (text) => `<b>${text}</b>`);
		expect(next?.sheets[0].timelines.map((t) => t.text)).toEqual([
			'<b>a</b>',
			'b',
			'<b>c</b>',
		]);
	});

	it('multiple이 아니면 null', () => {
		const off = state({
			sheets: [{ ...state().sheets[0], multipleActive: false }],
		});
		expect(updateActiveSelectedTexts(off, (text) => `<b>${text}</b>`)).toBeNull();
	});

	it('선택 행이 없으면 null', () => {
		const empty = state({
			sheets: [{ ...state().sheets[0], selectedRows: [] }],
		});
		expect(updateActiveSelectedTexts(empty, (text) => `<b>${text}</b>`)).toBeNull();
	});

	it('변화가 없으면 null (transform이 같은 값)', () => {
		expect(updateActiveSelectedTexts(state(), (text) => text)).toBeNull();
	});

	it('활성 탭만 patch', () => {
		const two = state({
			active: 1,
			sheets: [
				state().sheets[0],
				{
					...state().sheets[0],
					name: 'sheet2',
					timelines: [{ text: 'x' }, { text: 'y' }],
					selectedRows: [1],
				},
			],
		});
		const next = updateActiveSelectedTexts(two, (text) => `<i>${text}</i>`);
		expect(next?.sheets[0].timelines.map((t) => t.text)).toEqual(['a', 'b', 'c']);
		expect(next?.sheets[1].timelines.map((t) => t.text)).toEqual(['x', '<i>y</i>']);
	});
});
