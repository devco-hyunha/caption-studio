import type { SheetTimelineItem, SheetsState } from '@/entities/subtitle-sheet';
import type { SheetRowView, SheetTabView } from '../../types';
import { calcRowHeight } from '../row-height';
import { formatTimecode } from '@/shared/lib/timecode';

/** dur 열 — (end - start) 초 */
const formatDurationSec = (start: number, end: number) => ((end - start) / 1000).toFixed(3);

/** start 없으면 sync를 시작점으로 사용 (옛 JSON 호환) */
const resolveStart = (timeline: SheetTimelineItem) => {
	const start = Number(timeline.start);
	if (Number.isFinite(start)) return start;
	const sync = Number(timeline.sync);
	if (Number.isFinite(sync)) return sync;
	return 0;
};

/** text/memo는 HTML 문자열 그대로 (그 외 타입은 빈 문자열) */
const asHtmlString = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * 타임라인 → 행 뷰.
 * end가 없으면 다음 행 start로 채우고, 마지막 행이면 start를 쓴다.
 */
const mapTimelinesToRows = (
	timelines: SheetTimelineItem[],
	selectedRows: readonly number[] = [],
): SheetRowView[] => {
	const selectedSet = new Set(selectedRows);
	return timelines.map((timeline, index, list) => {
		const start = resolveStart(timeline);
		const nextStart = list[index + 1] ? resolveStart(list[index + 1]) : undefined;
		const storedEnd = Number(timeline.end);
		const end = Number.isFinite(storedEnd)
			? storedEnd
			: Number.isFinite(nextStart)
				? (nextStart as number)
				: start;

		const text = asHtmlString(timeline.text);

		return {
			index,
			starttime: formatTimecode(start),
			endtime: formatTimecode(end),
			dur: formatDurationSec(start, end),
			text,
			memo: asHtmlString(timeline.memo),
			height: calcRowHeight(text),
			isSelected: selectedSet.has(index),
		};
	});
};

/** 활성 시트의 행 뷰 (다중 선택 반영) */
const getActiveSheetRows = (state: SheetsState): SheetRowView[] => {
	const sheet = state.sheets[state.active] ?? state.sheets[0];
	if (!sheet) return mapTimelinesToRows([]);
	return mapTimelinesToRows(sheet.timelines, sheet.selectedRows);
};

const toSheetTabs = (sheets: SheetsState['sheets']): SheetTabView[] =>
	sheets.map((sheet) => ({ name: sheet.name }));

export {
	getActiveSheetRows,
	mapTimelinesToRows,
	toSheetTabs,
};
