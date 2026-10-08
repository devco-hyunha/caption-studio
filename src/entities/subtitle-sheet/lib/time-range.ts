import type { SheetTimelineItem } from '../types';

/** `/` seek.js — end 없을 때 쓰는 열린 구간 상한 */
const OPEN_END_MS = 999_999;

/** 행 시작 ms. start → sync → 0. 행 없으면 null */
const resolveStartMs = (row: SheetTimelineItem | undefined): number | null => {
	if (!row) return null;
	const start = Number(row.start);
	if (Number.isFinite(start)) return start;
	const sync = Number(row.sync);
	if (Number.isFinite(sync)) return sync;
	return 0;
};

/**
 * end가 비어 있으면(0·undefined 등 falsy) 다음 행 start, 없으면 OPEN_END_MS.
 * 입력 timelines는 변경하지 않는다.
 */
const resolveEndMs = (
	row: SheetTimelineItem,
	index: number,
	timelines: readonly SheetTimelineItem[],
): number => {
	if (row.end) return Number(row.end);
	const nextStart = resolveStartMs(timelines[index + 1]);
	return nextStart != null ? nextStart : OPEN_END_MS;
};

const isActiveAt = (
	row: SheetTimelineItem,
	rowIndex: number,
	timelines: readonly SheetTimelineItem[],
	ms: number,
): boolean => {
	const start = resolveStartMs(row);
	if (start == null) return false;
	const end = resolveEndMs(row, rowIndex, timelines);
	return start <= ms && end > ms;
};

export { OPEN_END_MS, isActiveAt, resolveEndMs, resolveStartMs };
