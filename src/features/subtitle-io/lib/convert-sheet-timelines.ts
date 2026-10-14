import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import { converters } from '@/entities/subtitle';
import { cloneTimeline, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import { toSubtitleTimeline } from './to-subtitle-timeline';

/** 시트 timelines SMI ↔ SRT 변환 */
const convertSheetTimelines = (
  timelines: readonly SheetTimelineItem[],
  from: SubtitleFormat,
  to: SubtitleFormat,
): SheetTimelineItem[] => {
  if (from === to) return timelines.map((item) => ({ ...item }));

  const converted = converters[to](from, timelines.map(toSubtitleTimeline));

  return converted.timelines.map(cloneTimeline);
};

export { convertSheetTimelines };
