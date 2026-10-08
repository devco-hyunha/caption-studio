import { describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '../types';
import { OPEN_END_MS } from './time-range';
import { timeSearch } from './time-search';

const rows = (
	items: Array<Pick<SheetTimelineItem, 'start' | 'end' | 'text'>>,
): SheetTimelineItem[] => items.map((item) => ({ ...item }));

describe('timeSearch', () => {
	const timelines = rows([
		{ start: 0, end: 1000, text: 'a' },
		{ start: 1000, end: 2000, text: 'b' },
		{ start: 3000, end: 4000, text: 'c' },
	]);

	it('구간 안 행을 찾고 visible true', () => {
		expect(timeSearch(timelines, 500)).toEqual({
			index: 0,
			visible: true,
			timeline: { start: 0, end: 1000, text: 'a' },
		});
		expect(timeSearch(timelines, 1000)).toEqual({
			index: 1,
			visible: true,
			timeline: { start: 1000, end: 2000, text: 'b' },
		});
		expect(timeSearch(timelines, 1999)).toMatchObject({ index: 1, visible: true });
	});

	it('end 경계: end와 같으면 해당 행이 아님 (start <= ms < end)', () => {
		expect(timeSearch(timelines, 2000)).toMatchObject({
			index: 2,
			visible: false,
		});
	});

	it('갭(이전 end ~ 다음 start): 다음 행 + visible false', () => {
		expect(timeSearch(timelines, 2500)).toEqual({
			index: 2,
			visible: false,
			timeline: { start: 3000, end: 4000, text: 'c' },
		});
	});

	it('end가 비어 있으면 다음 start로 연다', () => {
		const openEnd = rows([
			{ start: 0, text: 'a' },
			{ start: 1000, end: 2000, text: 'b' },
		]);
		const hit = timeSearch(openEnd, 500);
		expect(hit).toEqual({
			index: 0,
			visible: true,
			timeline: { start: 0, end: 1000, text: 'a' },
		});
		expect(openEnd[0]?.end).toBeUndefined();
	});

	it('마지막 행 end가 비어 있으면 OPEN_END_MS', () => {
		const lastOpen = rows([{ start: 100, text: 'only' }]);
		expect(timeSearch(lastOpen, 50_000)).toEqual({
			index: 0,
			visible: true,
			timeline: { start: 100, end: OPEN_END_MS, text: 'only' },
		});
	});

	it('end가 0이면 falsy로 보고 다음 start를 쓴다 (`/` !row.end)', () => {
		const zeroEnd = rows([
			{ start: 0, end: 0, text: 'a' },
			{ start: 800, end: 900, text: 'b' },
		]);
		expect(timeSearch(zeroEnd, 400)).toMatchObject({
			index: 0,
			visible: true,
			timeline: { end: 800 },
		});
	});

	it('빈 배열 · 모든 행보다 뒤 → index -1', () => {
		expect(timeSearch([], 0)).toEqual({
			index: -1,
			visible: false,
			timeline: null,
		});
		expect(timeSearch(timelines, 10_000)).toEqual({
			index: -1,
			visible: false,
			timeline: null,
		});
	});

	it('입력 timelines를 mutate하지 않는다', () => {
		const source = rows([{ start: 0, text: 'x' }]);
		timeSearch(source, 10);
		expect(source[0]).toEqual({ start: 0, text: 'x' });
	});
});
