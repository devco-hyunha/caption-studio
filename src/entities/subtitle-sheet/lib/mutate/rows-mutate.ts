/** 행 CRUD 순수 로직 — 탭 CRUD(`sheet-mutate`)와 분리 */
import { cloneTimeline } from '../sheet-core';
import type { SheetTimelineFormat, SheetTimelineItem } from '../../types';

const createEmptyTimeline = (): SheetTimelineItem => cloneTimeline();

/**
 * 이웃 행 기준으로 기본 시각 채움.
 */
const fillDefaultTimes = (
	data: SheetTimelineItem,
	neighbor: SheetTimelineItem | null,
	format: SheetTimelineFormat,
): SheetTimelineItem => {
	if (!neighbor) return data;

	const next = cloneTimeline(data);
	if (format === 'srt') {
		if (Number(next.start) === 0) next.start = neighbor.end;
		if (Number(next.end) === 0) next.end = neighbor.end;
		return next;
	}
	if (Number(next.start) === 0) next.start = neighbor.start;
	return next;
};

/**
 * `insertIndex` 위치에 행 삽입. 반환 타임라인은 새 배열.
 */
const insertTimelineAt = (
	timelines: readonly SheetTimelineItem[],
	insertIndex: number,
	data: SheetTimelineItem,
	format: SheetTimelineFormat,
): SheetTimelineItem[] => {
	const clamped = Math.max(0, Math.min(insertIndex, timelines.length));
	const lastIndexBefore = Math.max(0, timelines.length - 1);
	const neighbor =
		clamped < lastIndexBefore
			? (timelines[clamped] ?? null)
			: clamped > 0
				? (timelines[clamped - 1] ?? null)
				: null;

	const filled = fillDefaultTimes(data, neighbor, format);
	return [...timelines.slice(0, clamped), filled, ...timelines.slice(clamped)];
};

/**
 * 현재 행 뒤에 빈 행 삽입. 새 행 인덱스를 함께 반환.
 */
const insertTimelineAfter = (
	timelines: readonly SheetTimelineItem[],
	row: number,
	format: SheetTimelineFormat,
): { timelines: SheetTimelineItem[]; insertIndex: number } => {
	const insertIndex = Math.max(0, row + 1);
	return {
		insertIndex,
		timelines: insertTimelineAt(timelines, insertIndex, createEmptyTimeline(), format),
	};
};

/**
 * 행 삭제. 마지막 1행이면 빈 타임라인으로 교체.
 */
const removeTimelineAt = (
	timelines: readonly SheetTimelineItem[],
	row: number,
): { timelines: SheetTimelineItem[]; focusRow: number; cleared: boolean } | null => {
	if (row < 0 || row >= timelines.length) return null;

	if (timelines.length <= 1) {
		return {
			timelines: [createEmptyTimeline()],
			focusRow: 0,
			cleared: true,
		};
	}

	const next = [...timelines.slice(0, row), ...timelines.slice(row + 1)];
	const lastIndex = next.length - 1;
	const focusRow = Math.min(row, lastIndex);
	return { timelines: next, focusRow: Math.max(0, focusRow), cleared: false };
};

export {
	createEmptyTimeline,
	fillDefaultTimes,
	insertTimelineAfter,
	insertTimelineAt,
	removeTimelineAt,
};
