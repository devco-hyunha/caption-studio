import type { SheetTimelineItem, TimeSlotIndex } from '../types';
import { MINUTE_MS, minuteKey } from './time-slot-index';
import { resolveStartMs } from './time-range';

/** start 동률이면 더 작은 row index */
const isBetterNext = (
	startMs: number,
	rowIndex: number,
	bestStart: number,
	bestIndex: number | null,
) => {
	if (bestIndex == null) return true;
	if (startMs < bestStart) return true;
	if (startMs > bestStart) return false;
	return rowIndex < bestIndex;
};

const isBetterPrev = (
	startMs: number,
	rowIndex: number,
	bestStart: number,
	bestIndex: number | null,
) => {
	if (bestIndex == null) return true;
	if (startMs > bestStart) return true;
	if (startMs < bestStart) return false;
	return rowIndex < bestIndex;
};

const findNextStartNeighborIndexFull = (
	timelines: readonly SheetTimelineItem[],
	fromMs: number,
): number | null => {
	let bestIndex: number | null = null;
	let bestStart = Number.POSITIVE_INFINITY;

	for (let rowIndex = 0; rowIndex < timelines.length; rowIndex += 1) {
		const startMs = resolveStartMs(timelines[rowIndex]);
		if (startMs == null || startMs <= fromMs) continue;
		if (!isBetterNext(startMs, rowIndex, bestStart, bestIndex)) continue;
		bestStart = startMs;
		bestIndex = rowIndex;
	}

	return bestIndex;
};

const findPrevStartNeighborIndexFull = (
	timelines: readonly SheetTimelineItem[],
	fromMs: number,
): number | null => {
	let bestIndex: number | null = null;
	let bestStart = Number.NEGATIVE_INFINITY;

	for (let rowIndex = 0; rowIndex < timelines.length; rowIndex += 1) {
		const startMs = resolveStartMs(timelines[rowIndex]);
		if (startMs == null || startMs >= fromMs) continue;
		if (!isBetterPrev(startMs, rowIndex, bestStart, bestIndex)) continue;
		bestStart = startMs;
		bestIndex = rowIndex;
	}

	return bestIndex;
};

/**
 * fromMs 이후 가장 가까운 start 행.
 * 분 슬롯이 있으면 현재 분부터 뒤로 버킷을 늘려 가며 찾는다.
 */
const findNextStartNeighborIndex = (
	timelines: readonly SheetTimelineItem[],
	fromMs: number,
	slots?: TimeSlotIndex,
): number | null => {
	if (slots == null || slots.size === 0) {
		return findNextStartNeighborIndexFull(timelines, fromMs);
	}

	const startMinute = minuteKey(Math.max(0, fromMs));
	let maxMinute = startMinute;
	for (const minute of slots.keys()) {
		if (minute > maxMinute) maxMinute = minute;
	}

	let bestIndex: number | null = null;
	let bestStart = Number.POSITIVE_INFINITY;

	for (let minute = startMinute; minute <= maxMinute; minute += 1) {
		const bucket = slots.get(minute);
		if (bucket) {
			for (const rowIndex of bucket) {
				const startMs = resolveStartMs(timelines[rowIndex]);
				if (startMs == null || startMs <= fromMs) continue;
				if (!isBetterNext(startMs, rowIndex, bestStart, bestIndex)) continue;
				bestStart = startMs;
				bestIndex = rowIndex;
			}
		}

		// 이 분 안에 속하는 best면 이후 분은 start가 더 큼
		if (bestIndex != null && bestStart < (minute + 1) * MINUTE_MS) {
			return bestIndex;
		}
	}

	return bestIndex;
};

/**
 * fromMs 이전 가장 가까운 start 행.
 * 분 슬롯이 있으면 현재 분부터 앞으로 버킷을 늘려 가며 찾는다.
 */
const findPrevStartNeighborIndex = (
	timelines: readonly SheetTimelineItem[],
	fromMs: number,
	slots?: TimeSlotIndex,
): number | null => {
	if (slots == null || slots.size === 0) {
		return findPrevStartNeighborIndexFull(timelines, fromMs);
	}

	const startMinute = minuteKey(Math.max(0, fromMs));
	let minMinute = startMinute;
	for (const minute of slots.keys()) {
		if (minute < minMinute) minMinute = minute;
	}

	let bestIndex: number | null = null;
	let bestStart = Number.NEGATIVE_INFINITY;

	for (let minute = startMinute; minute >= minMinute; minute -= 1) {
		const bucket = slots.get(minute);
		if (bucket) {
			for (const rowIndex of bucket) {
				const startMs = resolveStartMs(timelines[rowIndex]);
				if (startMs == null || startMs >= fromMs) continue;
				if (!isBetterPrev(startMs, rowIndex, bestStart, bestIndex)) continue;
				bestStart = startMs;
				bestIndex = rowIndex;
			}
		}

		// 이 분 이상에 속하는 best면 이전 분은 start가 더 작음
		if (bestIndex != null && bestStart >= minute * MINUTE_MS) {
			return bestIndex;
		}
	}

	return bestIndex;
};

export {
	findNextStartNeighborIndex,
	findPrevStartNeighborIndex,
};
