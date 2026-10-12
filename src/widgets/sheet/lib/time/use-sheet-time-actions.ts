import { useSheetStore } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type {
	SheetColumnId,
	UseSheetTimeActionsParams,
	UseSheetTimeActionsResult,
} from '../../types';
import { isMultipleActive } from '../is-multiple-active';
import { nudgeTimelineByStep, nudgeTimelineColumn, readTimeJumpMs } from '../time-jump';

/** time 열 타깃 — starttime/endtime만 */
const isTimeColumnPair = (
	column: SheetColumnId | null | undefined,
): column is 'starttime' | 'endtime' => column === 'starttime' || column === 'endtime';

/**
 * 시트 time ±jump 동작 API — Ctrl+Plus/Minus.
 * 다중 선택은 선택 행 start/end 일괄, 단건은 포커스 time 열만. jump는 `jump_val`(기본 30ms).
 */
const useSheetTimeActions = ({
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
		const patches = new Map<number, SheetTimelineItem>();
		sheet.selectedRows.forEach((rowIndex) => {
			const timeline = sheet.timelines[rowIndex];
			if (!timeline) return;
			patches.set(rowIndex, nudgeTimelineByStep(timeline, step, direction));
		});

		useSheetStore.getState().patchSelectedTimelines(patches);
	};

	const nudgeFocusedCell = (direction: 'plus' | 'minus') => {
		if (isMultipleActive() || !isTimeTarget() || currentRowIndex == null) return;
		if (!isTimeColumnPair(currentColumn)) return;

		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		const timeline = sheet?.timelines[currentRowIndex];
		if (!timeline) return;

		const step = readTimeJumpMs();
		const next = nudgeTimelineColumn(timeline, currentColumn, step, direction);
		if (next.start === timeline.start && next.end === timeline.end) return;

		useSheetStore.getState().patchActiveTimeline(currentRowIndex, next);
	};

	const timePlus = () => {
		// mutate 직전 검색 패널 닫기
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
