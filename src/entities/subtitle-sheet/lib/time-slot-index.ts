import type { SheetTimelineItem, TimeSlotIndex } from '../types';
import { resolveEndMs, resolveStartMs } from './time-range';

const MINUTE_MS = 60_000;

const minuteKey = (ms: number) => Math.floor(ms / MINUTE_MS);

/**
 * [start, end) 가 걸치는 분 키 목록.
 * end <= start 이면 빈 배열.
 */
const minutesSpannedByRange = (startMs: number, endMs: number): number[] => {
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
		return [];
	}
	const from = minuteKey(startMs);
	const to = minuteKey(endMs - 1);
	const keys: number[] = [];
	for (let minute = from; minute <= to; minute += 1) {
		keys.push(minute);
	}
	return keys;
};

const resolveRowRange = (
	row: SheetTimelineItem,
	rowIndex: number,
	timelines: readonly SheetTimelineItem[],
): { startMs: number; endMs: number } | null => {
	const startMs = resolveStartMs(row);
	if (startMs == null) return null;
	const endMs = resolveEndMs(row, rowIndex, timelines);
	return { startMs, endMs };
};

const addIndexToMinute = (slots: TimeSlotIndex, minute: number, rowIndex: number) => {
	const bucket = slots.get(minute);
	if (!bucket) {
		slots.set(minute, [rowIndex]);
		return;
	}
	if (!bucket.includes(rowIndex)) bucket.push(rowIndex);
};

const removeIndexFromMinute = (slots: TimeSlotIndex, minute: number, rowIndex: number) => {
	const bucket = slots.get(minute);
	if (!bucket) return;
	const next = bucket.filter((index) => index !== rowIndex);
	if (next.length === 0) slots.delete(minute);
	else slots.set(minute, next);
};

const removeRowFromAllSlots = (slots: TimeSlotIndex, rowIndex: number) => {
	for (const minute of [...slots.keys()]) {
		removeIndexFromMinute(slots, minute, rowIndex);
	}
};

const addRowToSlots = (
	slots: TimeSlotIndex,
	rowIndex: number,
	row: SheetTimelineItem,
	timelines: readonly SheetTimelineItem[],
) => {
	const range = resolveRowRange(row, rowIndex, timelines);
	if (!range) return;
	for (const minute of minutesSpannedByRange(range.startMs, range.endMs)) {
		addIndexToMinute(slots, minute, rowIndex);
	}
};

/**
 * timelines 전체로 분 슬롯 인덱스를 새로 만든다.
 * import · 탭 전환 · 대량 교체용.
 */
const rebuildTimeSlotIndex = (
	timelines: readonly SheetTimelineItem[],
): TimeSlotIndex => {
	const slots: TimeSlotIndex = new Map();
	for (let rowIndex = 0; rowIndex < timelines.length; rowIndex += 1) {
		const row = timelines[rowIndex];
		if (!row) continue;
		addRowToSlots(slots, rowIndex, row, timelines);
	}
	return slots;
};

/**
 * 한 행의 시간 구간만 슬롯에 다시 반영한다 (index 번호는 그대로).
 * 셀 시간 수정 · 해당 행 replace / undo 패치용.
 * `row`가 없으면 슬롯에서만 제거.
 */
const syncRowTimeSlot = (
	slots: TimeSlotIndex,
	rowIndex: number,
	timelines: readonly SheetTimelineItem[],
): TimeSlotIndex => {
	removeRowFromAllSlots(slots, rowIndex);
	const row = timelines[rowIndex];
	if (row) addRowToSlots(slots, rowIndex, row, timelines);
	return slots;
};

/**
 * `fromIndex` 이상 행 번호를 `delta`만큼 민다 (insert +1 / remove 후 -1).
 */
const shiftTimeSlotIndices = (
	slots: TimeSlotIndex,
	fromIndex: number,
	delta: number,
): TimeSlotIndex => {
	if (delta === 0) return slots;
	for (const [minute, rows] of slots) {
		const shifted = rows.map((index) =>
			index >= fromIndex ? index + delta : index,
		);
		slots.set(minute, shifted);
	}
	return slots;
};

/**
 * 행 삽입 후: 기존 index를 +1 시프트한 뒤 새 행을 슬롯에 넣는다.
 * `timelines`는 삽입이 반영된 배열.
 */
const insertRowTimeSlot = (
	slots: TimeSlotIndex,
	atIndex: number,
	timelines: readonly SheetTimelineItem[],
): TimeSlotIndex => {
	shiftTimeSlotIndices(slots, atIndex, 1);
	return syncRowTimeSlot(slots, atIndex, timelines);
};

/**
 * 행 삭제 후: 해당 index 제거 · 이후 index를 -1.
 * `timelines`는 삭제가 반영된 배열 (시프트 검증용으로는 불필요, API 대칭).
 */
const removeRowTimeSlot = (slots: TimeSlotIndex, atIndex: number): TimeSlotIndex => {
	removeRowFromAllSlots(slots, atIndex);
	shiftTimeSlotIndices(slots, atIndex + 1, -1);
	return slots;
};

/** 현재 ms가 속한 분 버킷의 후보 행 index */
const candidateRowIndicesAt = (slots: TimeSlotIndex, ms: number): number[] => {
	const bucket = slots.get(minuteKey(ms));
	return bucket ? [...bucket] : [];
};

export {
	MINUTE_MS,
	candidateRowIndicesAt,
	insertRowTimeSlot,
	minuteKey,
	minutesSpannedByRange,
	rebuildTimeSlotIndex,
	removeRowTimeSlot,
	shiftTimeSlotIndices,
	syncRowTimeSlot,
};
