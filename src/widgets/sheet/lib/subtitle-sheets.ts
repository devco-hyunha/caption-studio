import type { SheetTimelineItem, SheetsState } from '@/entities/subtitle-sheet';
import type { SheetRowView, SheetTabView } from '../types';
import { calcRowHeight } from './row-height';
import { formatTimecode } from '@/shared/lib/timecode';

const formatDurationSec = (start: number, end: number) => ((end - start) / 1000).toFixed(3);

const resolveStart = (timeline: SheetTimelineItem) => {
	const start = Number(timeline.start);
	if (Number.isFinite(start)) return start;
	const sync = Number(timeline.sync);
	if (Number.isFinite(sync)) return sync;
	return 0;
};

const asHtmlString = (value: unknown) => (typeof value === 'string' ? value : '');

const mapTimelinesToRows = (timelines: SheetTimelineItem[]): SheetRowView[] =>
	timelines.map((timeline, index, list) => {
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
		};
	});

const getActiveSheetRows = (state: SheetsState): SheetRowView[] => {
	const sheet = state.sheets[state.active] ?? state.sheets[0];
	if (!sheet) return mapTimelinesToRows([]);
	return mapTimelinesToRows(sheet.timelines);
};

const toSheetTabs = (sheets: SheetsState['sheets']): SheetTabView[] =>
	sheets.map((sheet) => ({ name: sheet.name }));

export {
	getActiveSheetRows,
	mapTimelinesToRows,
	toSheetTabs,
};
