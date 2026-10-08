import { describe, expect, it } from 'vitest';
import { resolveStartMs, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import { resolveNeighborFromMs } from './seek-player-to-row';

const overlappingSample = (): SheetTimelineItem[] => [
	{ start: 5_000, end: 10_000, text: 'a' },
	{ start: 7_000, end: 10_000, text: 'b' },
	{ start: 5_000, end: 20_000, text: 'c' },
	{ start: 15_000, end: 20_000, text: 'd' },
];

describe('resolveStartMs (re-export)', () => {
	it('start 우선', () => {
		expect(resolveStartMs({ start: 1500, text: 'a' })).toBe(1500);
	});

	it('undefined면 null', () => {
		expect(resolveStartMs(undefined)).toBeNull();
	});
});

describe('resolveNeighborFromMs', () => {
	it('활성 있으면 Prev=min · Next=max start', () => {
		const timelines = overlappingSample();
		expect(resolveNeighborFromMs(timelines, [0, 1, 2], 'prev')).toBe(5_000);
		expect(resolveNeighborFromMs(timelines, [0, 1, 2], 'next')).toBe(7_000);
	});

	it('활성 없으면 플레이어 시각(미등록 시 0)', () => {
		const timelines = overlappingSample();
		expect(resolveNeighborFromMs(timelines, [], 'prev')).toBe(0);
		expect(resolveNeighborFromMs(timelines, [], 'next')).toBe(0);
	});
});
