import { describe, expect, it } from 'vitest';
import type { SheetsState } from '../types';
import { replaceTimelineAt, replaceTimelinePatches, updateActiveSelectedTexts } from './active-sheet';

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

describe('replaceTimelineAt', () => {
	it('행 타임라인을 ms 값으로 직접 patch', () => {
		const next = replaceTimelineAt(state(), 1, { start: 130, end: 230, text: 'b' });
		expect(next?.sheets[0].timelines[1]).toEqual({ start: 130, end: 230, text: 'b' });
		expect(next?.sheets[0].timelines[0]).toEqual({ text: 'a' });
	});

	it('행이 없으면 null', () => {
		expect(replaceTimelineAt(state(), 9, { start: 0, end: 0 })).toBeNull();
	});

	it('patchActiveSelectedRows와 달리 multiple이 아니어도 patch', () => {
		const off = state({
			sheets: [{ ...state().sheets[0], multipleActive: false }],
		});
		const next = replaceTimelineAt(off, 0, { start: 50, end: 60, text: 'a' });
		expect(next?.sheets[0].timelines[0]).toEqual({ start: 50, end: 60, text: 'a' });
	});
});

describe('replaceTimelinePatches', () => {
	it('선택 행 타임라인만 일괄 patch', () => {
		const patches = new Map([
			[0, { start: 10, end: 20, text: 'a' }],
			[2, { start: 30, end: 40, text: 'c' }],
		]);
		const next = replaceTimelinePatches(state(), patches);
		expect(next?.sheets[0].timelines).toEqual([
			{ start: 10, end: 20, text: 'a' },
			{ text: 'b' },
			{ start: 30, end: 40, text: 'c' },
		]);
	});

	it('multiple이 아니면 null', () => {
		const off = state({
			sheets: [{ ...state().sheets[0], multipleActive: false }],
		});
		expect(replaceTimelinePatches(off, new Map([[0, { start: 10 }]]))).toBeNull();
	});

	it('선택·patch 없으면 null', () => {
		const empty = state({
			sheets: [{ ...state().sheets[0], selectedRows: [] }],
		});
		expect(replaceTimelinePatches(empty, new Map([[0, { start: 10 }]]))).toBeNull();
		expect(replaceTimelinePatches(state(), new Map())).toBeNull();
	});

	it('활성 탭만 patch', () => {
		const two = state({
			active: 1,
			sheets: [
				state().sheets[0],
				{
					...state().sheets[0],
					name: 'sheet2',
					timelines: [
						{ start: 1, text: 'x' },
						{ start: 2, text: 'y' },
					],
					selectedRows: [1],
				},
			],
		});
		const next = replaceTimelinePatches(two, new Map([[1, { start: 99, text: 'y' }]]));
		expect(next?.sheets[0].timelines[0]).toEqual({ text: 'a' });
		expect(next?.sheets[1].timelines[1]).toEqual({ start: 99, text: 'y' });
	});
});
