import { describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '../types';
import {
	candidateRowIndicesAt,
	insertRowTimeSlot,
	minuteKey,
	rebuildTimeSlotIndex,
	removeRowTimeSlot,
	syncRowTimeSlot,
} from './time-slot-index';
import { timeSearchAll } from './time-search';

const rows = (
	items: Array<Pick<SheetTimelineItem, 'start' | 'end' | 'text'>>,
): SheetTimelineItem[] => items.map((item) => ({ ...item }));

describe('rebuildTimeSlotIndex', () => {
	it('걸치는 분 버킷에 행을 넣는다', () => {
		const timelines = rows([
			{ start: 0, end: 90_000, text: 'a' },
			{ start: 60_000, end: 120_000, text: 'b' },
		]);
		const slots = rebuildTimeSlotIndex(timelines);
		expect(candidateRowIndicesAt(slots, 30_000).sort()).toEqual([0]);
		expect(candidateRowIndicesAt(slots, 70_000).sort()).toEqual([0, 1]);
		// 분 버킷은 후보(상위집합). 100s는 1분 대라 row0도 후보에 남을 수 있음 → 정밀 필터는 timeSearchAll
		expect(timeSearchAll(timelines, 100_000, slots).indices).toEqual([1]);
	});

	it('분 경계를 넘는 행은 양쪽에 들어간다', () => {
		const timelines = rows([{ start: 55_000, end: 65_000, text: 'edge' }]);
		const slots = rebuildTimeSlotIndex(timelines);
		expect(slots.get(minuteKey(55_000))).toContain(0);
		expect(slots.get(minuteKey(65_000 - 1))).toContain(0);
	});
});

describe('syncRowTimeSlot / insert / remove', () => {
	it('행 시간 변경 시 슬롯만 갱신한다', () => {
		const timelines = rows([
			{ start: 0, end: 30_000, text: 'a' },
			{ start: 60_000, end: 90_000, text: 'b' },
		]);
		const slots = rebuildTimeSlotIndex(timelines);
		timelines[0] = { start: 60_000, end: 90_000, text: 'a' };
		syncRowTimeSlot(slots, 0, timelines);
		expect(candidateRowIndicesAt(slots, 10_000)).toEqual([]);
		expect(candidateRowIndicesAt(slots, 70_000).sort()).toEqual([0, 1]);
	});

	it('insert 후 index 시프트 + 새 행 반영', () => {
		let timelines = rows([
			{ start: 0, end: 10_000, text: 'a' },
			{ start: 20_000, end: 30_000, text: 'c' },
		]);
		const slots = rebuildTimeSlotIndex(timelines);
		timelines = [
			timelines[0]!,
			{ start: 10_000, end: 20_000, text: 'b' },
			timelines[1]!,
		];
		insertRowTimeSlot(slots, 1, timelines);
		expect(timeSearchAll(timelines, 15_000, slots).indices).toEqual([1]);
		expect(timeSearchAll(timelines, 25_000, slots).indices).toEqual([2]);
	});

	it('remove 후 index 시프트', () => {
		let timelines = rows([
			{ start: 0, end: 10_000, text: 'a' },
			{ start: 10_000, end: 20_000, text: 'b' },
			{ start: 20_000, end: 30_000, text: 'c' },
		]);
		const slots = rebuildTimeSlotIndex(timelines);
		timelines = [timelines[0]!, timelines[2]!];
		removeRowTimeSlot(slots, 1);
		expect(timeSearchAll(timelines, 25_000, slots).indices).toEqual([1]);
	});
});

describe('timeSearchAll', () => {
	it('겹치는 여러 행을 모두 반환한다', () => {
		const timelines = rows([
			{ start: 0, end: 1000, text: 'a' },
			{ start: 500, end: 1500, text: 'b' },
			{ start: 2000, end: 3000, text: 'c' },
		]);
		const slots = rebuildTimeSlotIndex(timelines);
		expect(timeSearchAll(timelines, 700, slots).indices).toEqual([0, 1]);
		expect(timeSearchAll(timelines, 700).indices).toEqual([0, 1]);
	});

	it('slots 없이도 동일 결과를 낸다', () => {
		const timelines = rows([
			{ start: 0, end: 100, text: 'a' },
			{ start: 50, end: 150, text: 'b' },
		]);
		expect(timeSearchAll(timelines, 75).indices).toEqual(
			timeSearchAll(timelines, 75, rebuildTimeSlotIndex(timelines)).indices,
		);
	});

	it('빈 slots Map이면 전수 스캔으로 폴백한다', () => {
		const timelines = rows([
			{ start: 0, end: 1000, text: 'a' },
			{ start: 500, end: 1500, text: 'b' },
		]);
		expect(timeSearchAll(timelines, 700, new Map()).indices).toEqual([0, 1]);
	});

	it('sync만 있는 행도 슬롯에 들어가 검색된다', () => {
		const timelines: SheetTimelineItem[] = [
			{ sync: 1000, end: 2000, text: 'sync-only' },
		];
		const slots = rebuildTimeSlotIndex(timelines);
		expect(candidateRowIndicesAt(slots, 1500)).toContain(0);
		expect(timeSearchAll(timelines, 1500, slots).indices).toEqual([0]);
	});
});
