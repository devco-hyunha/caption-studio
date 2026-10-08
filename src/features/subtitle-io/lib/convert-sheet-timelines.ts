import { converters, type SubtitleFormat } from '@/entities/subtitle';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

const toSubtitleTimeline = (item: SheetTimelineItem) => ({
	start: typeof item.start === 'number' ? item.start : 0,
	end: typeof item.end === 'number' ? item.end : undefined,
	text: typeof item.text === 'string' ? item.text : '',
	memo: typeof item.memo === 'string' ? item.memo : '',
});

const toSheetTimelineItem = (item: {
	start: number;
	end?: number;
	text: string;
	memo: string;
}): SheetTimelineItem => ({
	start: item.start,
	end: item.end,
	text: item.text,
	memo: item.memo,
});

/** 시트 timelines SMI ↔ SRT 변환 */
const convertSheetTimelines = (
	timelines: readonly SheetTimelineItem[],
	from: SubtitleFormat,
	to: SubtitleFormat,
): SheetTimelineItem[] => {
	if (from === to) return timelines.map((item) => ({ ...item }));

	const converted = converters[to](
		from,
		timelines.map(toSubtitleTimeline),
	);

	return converted.timelines.map(toSheetTimelineItem);
};

export { convertSheetTimelines };
