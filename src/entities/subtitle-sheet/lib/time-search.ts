import type { SheetTimelineItem, TimeSearchAllHit, TimeSearchHit, TimeSlotIndex } from '../types';
import { cloneTimeline } from './sheet-mutate';
import { OPEN_END_MS, isActiveAt, resolveEndMs } from './time-range';
import { candidateRowIndicesAt } from './time-slot-index';

/**
 * 재생 시각(ms)으로 자막 행을 찾는다. (`/` `sheet.timeSearch` parity · 첫 행만)
 *
 * @param timelines - 활성 시트 timelines
 * @param ms - 플레이어 시각(밀리초). `/`는 `parseInt(sec * 1000)` 후 전달
 */
const timeSearch = (
	timelines: readonly SheetTimelineItem[],
	ms: number,
): TimeSearchHit => {
	let index = timelines.findIndex((row, rowIndex) =>
		isActiveAt(row, rowIndex, timelines, ms),
	);
	let visible = true;

	if (index === -1) {
		index = timelines.findIndex((row) => Number(row.start) > ms);
		visible = false;
	}

	if (index < 0) {
		return { index: -1, visible: false, timeline: null };
	}

	const source = timelines[index];
	if (!source) {
		return { index: -1, visible: false, timeline: null };
	}

	const timeline = cloneTimeline(source);
	timeline.end = resolveEndMs(source, index, timelines);

	return { index, visible, timeline };
};

/**
 * 겹치는 모든 활성 행 index.
 * 슬롯이 비어 있지 않으면 해당 분 버킷 후보만, 없거나 빈 Map이면 전체 스캔.
 */
const timeSearchAll = (
	timelines: readonly SheetTimelineItem[],
	ms: number,
	slots?: TimeSlotIndex,
): TimeSearchAllHit => {
	const candidates =
		slots != null && slots.size > 0
			? candidateRowIndicesAt(slots, ms)
			: timelines.map((_, rowIndex) => rowIndex);

	const indices: number[] = [];
	for (const rowIndex of candidates) {
		const row = timelines[rowIndex];
		if (!row) continue;
		if (isActiveAt(row, rowIndex, timelines, ms)) indices.push(rowIndex);
	}

	indices.sort((left, right) => left - right);
	return { indices };
};

export { OPEN_END_MS, resolveEndMs, timeSearch, timeSearchAll };
