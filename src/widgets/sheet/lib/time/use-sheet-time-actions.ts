import { cloneTimeline, useSheetStore } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import {
	useSheetHistoryStore,
	type HistoryTimelinePatch,
} from '@/features/sheet-history';
import type {
	SheetColumnId,
	UseSheetTimeActionsParams,
	UseSheetTimeActionsResult,
} from '../../types';
import { isMultipleActive } from '../is-multiple-active';
import { resolveFocusCursor } from '../focus/resolve-focus-cursor';
import { nudgeTimelineByStep, nudgeTimelineColumn, readTimeJumpMs } from '../time-jump';

/** time Ã¬ÂÂ´ Ã­ÂÂÃªÂ¹Â Ã¢ÂÂ starttime/endtimeÃ«Â§Â */
const isTimeColumnPair = (
	column: SheetColumnId | null | undefined,
): column is 'starttime' | 'endtime' => column === 'starttime' || column === 'endtime';

/**
 * Ã¬ÂÂÃ­ÂÂ¸ time ÃÂ±jump Ã«ÂÂÃ¬ÂÂ API Ã¢ÂÂ Ctrl+Plus/Minus.
 * Ã«ÂÂ¤Ã¬Â¤Â Ã¬ÂÂ Ã­ÂÂÃ¬ÂÂ Ã¬ÂÂ Ã­ÂÂ Ã­ÂÂ start/end Ã¬ÂÂ¼ÃªÂ´Â, Ã«ÂÂ¨ÃªÂ±Â´Ã¬ÂÂ Ã­ÂÂ¬Ã¬Â»Â¤Ã¬ÂÂ¤ time Ã¬ÂÂ´Ã«Â§Â. jumpÃ«ÂÂ `jump_val`(ÃªÂ¸Â°Ã«Â³Â¸ 30ms).
 */
const useSheetTimeActions = ({
	format,
	currentRowIndex,
	currentColumn,
	isTimeTarget,
	closeSearchPanel,
}: UseSheetTimeActionsParams): UseSheetTimeActionsResult => {
	const nudgeSelectedRows = (direction: 'plus' | 'minus') => {
		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		if (!sheet?.multipleActive || sheet.selectedRows.length === 0) return;

		const step = readTimeJumpMs();
		const backups: HistoryTimelinePatch[] = [];
		const patches = new Map<number, SheetTimelineItem>();
		sheet.selectedRows.forEach((rowIndex) => {
			const timeline = sheet.timelines[rowIndex];
			if (!timeline) return;
			backups.push({ index: rowIndex, data: cloneTimeline(timeline) });
			patches.set(rowIndex, nudgeTimelineByStep(timeline, step, direction));
		});
		if (patches.size === 0) return;

		const ok = useSheetStore.getState().patchSelectedTimelines(patches);
		if (!ok) return;

		const afterSheet = useSheetStore.getState().sheets[store.active];
		const currents: HistoryTimelinePatch[] = backups.flatMap(({ index }) => {
			const timeline = afterSheet?.timelines[index];
			if (!timeline) return [];
			return [{ index, data: cloneTimeline(timeline) }];
		});
		if (currents.length === 0) return;

		useSheetHistoryStore.getState().pushHistory({
			command: `multi.${direction}`,
			id: null,
			before: backups,
			after: currents,
			current: resolveFocusCursor(format, currentRowIndex, currentColumn),
		});
	};

	const nudgeFocusedCell = (direction: 'plus' | 'minus') => {
		if (isMultipleActive() || !isTimeTarget() || currentRowIndex == null) return;
		if (!isTimeColumnPair(currentColumn)) return;

		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		const timeline = sheet?.timelines[currentRowIndex];
		if (!timeline) return;

		const step = readTimeJumpMs();
		const beforeSnap = cloneTimeline(timeline);
		const next = nudgeTimelineColumn(timeline, currentColumn, step, direction);
		if (next.start === timeline.start && next.end === timeline.end) return;

		const ok = useSheetStore.getState().patchActiveTimeline(currentRowIndex, next);
		if (!ok) return;

		const after =
			useSheetStore.getState().sheets[store.active]?.timelines[currentRowIndex] ?? next;
		const focus = resolveFocusCursor(format, currentRowIndex, currentColumn);
		useSheetHistoryStore.getState().pushHistory({
			command: 'update',
			id: currentRowIndex,
			before: beforeSnap,
			after: cloneTimeline(after),
			current: focus,
		});
	};

	const timePlus = () => {
		// mutate Ã¬Â§ÂÃ¬Â Â ÃªÂ²ÂÃ¬ÂÂ Ã­ÂÂ¨Ã«ÂÂ Ã«ÂÂ«ÃªÂ¸Â°
		closeSearchPanel();
		if (isMultipleActive()) {
			nudgeSelectedRows('plus');
			return;
		}
		nudgeFocusedCell('plus');
	};

	const timeMinus = () => {
		closeSearchPanel();
		if (isMultipleActive()) {
			nudgeSelectedRows('minus');
			return;
		}
		nudgeFocusedCell('minus');
	};

	return { timePlus, timeMinus };
};

export { useSheetTimeActions, isTimeColumnPair };
