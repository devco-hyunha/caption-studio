import { describe, expect, it } from 'vitest';
import {
	findNextStartNeighborIndex,
	findPrevStartNeighborIndex,
} from './start-neighbor';
import { rebuildTimeSlotIndex } from './time-slot-index';
import type { SheetTimelineItem } from '../types';

/** 사용자 예시: 5–10 / 7–10 / 5–20 / 15–20 (초) */
const overlappingSample = (): SheetTimelineItem[] => [
	{ start: 5_000, end: 10_000, text: 'a' },
	{ start: 7_000, end: 10_000, text: 'b' },
	{ start: 5_000, end: 20_000, text: 'c' },
	{ start: 15_000, end: 20_000, text: 'd' },
];

describe('findNextStartNeighborIndex / findPrevStartNeighborIndex', () => {
	it('6s에서 Next는 7s(index 1), Prev는 5s(더 작은 index 0)', () => {
		const timelines = overlappingSample();
		const slots = rebuildTimeSlotIndex(timelines);

		expect(findNextStartNeighborIndex(timelines, 6_000, slots)).toBe(1);
		expect(findPrevStartNeighborIndex(timelines, 6_000, slots)).toBe(0);
	});

	it('8s에서 Next는 15s(index 3), Prev는 7s(index 1)', () => {
		const timelines = overlappingSample();
		const slots = rebuildTimeSlotIndex(timelines);

		expect(findNextStartNeighborIndex(timelines, 8_000, slots)).toBe(3);
		expect(findPrevStartNeighborIndex(timelines, 8_000, slots)).toBe(1);
	});

	it('슬롯 없이 전수여도 동일', () => {
		const timelines = overlappingSample();
		expect(findNextStartNeighborIndex(timelines, 6_000)).toBe(1);
		expect(findPrevStartNeighborIndex(timelines, 6_000)).toBe(0);
	});

	it('끝에서는 Next null, 시작에서는 Prev null', () => {
		const timelines = overlappingSample();
		const slots = rebuildTimeSlotIndex(timelines);

		expect(findNextStartNeighborIndex(timelines, 15_000, slots)).toBeNull();
		expect(findPrevStartNeighborIndex(timelines, 5_000, slots)).toBeNull();
	});

	it('분 경계를 넘는 Next/Prev도 슬롯으로 찾는다', () => {
		const timelines: SheetTimelineItem[] = [
			{ start: 50_000, end: 55_000, text: 'a' },
			{ start: 70_000, end: 75_000, text: 'b' },
		];
		const slots = rebuildTimeSlotIndex(timelines);

		expect(findNextStartNeighborIndex(timelines, 51_000, slots)).toBe(1);
		expect(findPrevStartNeighborIndex(timelines, 71_000, slots)).toBe(1);
		expect(findPrevStartNeighborIndex(timelines, 70_000, slots)).toBe(0);
	});
});
