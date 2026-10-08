import {
	createEmptyTimeline,
	useSheetStore,
	type SheetTimelineItem,
} from '@/entities/subtitle-sheet';
import type { HistoryCursor, HistoryEntry, HistoryTimelinePatch } from '../types';

const isTimelineItem = (value: unknown): value is SheetTimelineItem =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isPatchList = (value: unknown): value is HistoryTimelinePatch[] =>
	Array.isArray(value);

/** history undo update 가드 — JSON.stringify 동등 */
const timelineSnapshotEquals = (
	left: SheetTimelineItem | null | undefined,
	right: SheetTimelineItem | null | undefined,
): boolean => JSON.stringify(left) === JSON.stringify(right);

/**
 * undo — entry before로 복원 + 포커스 좌표 반환.
 * insert undo → remove 후 clamp된 행 (Tab으로 넣은 마지막 행이면 한 줄 위).
 */
const applyHistoryUndo = (entry: HistoryEntry): HistoryCursor | null => {
	const store = useSheetStore.getState();
	const col = entry.current.col;

	if (entry.command.startsWith('multi.')) {
		if (!isPatchList(entry.before)) return null;
		if (!store.replaceTimelinePatches(entry.before)) return null;
		return { row: entry.current.row, col };
	}

	if (entry.command === 'insert') {
		if (entry.id == null) return null;
		const focusRow = store.removeTimelineAt(entry.id);
		if (focusRow == null) return null;
		return { row: focusRow, col };
	}

	if (entry.command === 'remove') {
		if (entry.id == null || !isTimelineItem(entry.before)) return null;
		if (!store.spliceTimelineAt(entry.id, entry.before)) return null;
		return { row: entry.id, col };
	}

	if (entry.command === 'update') {
		if (entry.id == null || !isTimelineItem(entry.before) || !isTimelineItem(entry.after)) {
			return null;
		}
		const sheet = store.sheets[store.active];
		const current = sheet?.timelines[entry.id];
		// timelines[id] === after 일 때만 복원
		if (!timelineSnapshotEquals(current, entry.after)) return null;
		if (!store.replaceTimelineAt(entry.id, entry.before)) return null;
		return { row: entry.current.row, col };
	}

	return null;
};

/**
 * redo — entry after 재적용 + 포커스.
 * insert redo → 삽입된 행으로 이동 (current.row = insertIndex).
 */
const applyHistoryRedo = (entry: HistoryEntry): HistoryCursor | null => {
	const store = useSheetStore.getState();
	const col = entry.current.col;

	if (entry.command.startsWith('multi.')) {
		if (!isPatchList(entry.after)) return null;
		if (!store.replaceTimelinePatches(entry.after)) return null;
		return { row: entry.current.row, col };
	}

	if (entry.command === 'insert') {
		if (entry.id == null || !isTimelineItem(entry.after)) return null;
		if (!store.spliceTimelineAt(entry.id, entry.after)) return null;
		return { row: entry.id, col };
	}

	if (entry.command === 'remove') {
		if (entry.id == null) return null;
		const focusRow = store.removeTimelineAt(entry.id);
		if (focusRow == null) return null;
		return { row: focusRow, col };
	}

	if (entry.command === 'update') {
		if (entry.id == null || !isTimelineItem(entry.after)) return null;
		if (!store.replaceTimelineAt(entry.id, entry.after)) return null;
		return { row: entry.current.row, col };
	}

	return null;
};

const cloneTimelineSnapshot = (timeline: SheetTimelineItem): SheetTimelineItem => ({
	start: timeline.start,
	end: timeline.end,
	sync: timeline.sync,
	text: timeline.text,
	memo: timeline.memo,
});

const emptyTimelineSnapshot = (): SheetTimelineItem => createEmptyTimeline();

export {
	applyHistoryRedo,
	applyHistoryUndo,
	cloneTimelineSnapshot,
	emptyTimelineSnapshot,
	timelineSnapshotEquals,
};
