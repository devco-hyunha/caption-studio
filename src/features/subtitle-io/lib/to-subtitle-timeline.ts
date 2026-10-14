import type { SubtitleTimeline } from '@/shared/types/subtitle-timeline';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

/** SheetTimelineItem → SubtitleTimeline (필드 정규화) — subtitle-io 공유 헬프 */
const toSubtitleTimeline = (item: SheetTimelineItem): SubtitleTimeline => ({
  start: typeof item.start === 'number' ? item.start : 0,
  end: typeof item.end === 'number' ? item.end : undefined,
  text: typeof item.text === 'string' ? item.text : '',
  memo: typeof item.memo === 'string' ? item.memo : '',
});

const toSubtitleTimelines = (timelines: readonly SheetTimelineItem[]): SubtitleTimeline[] =>
  timelines.map(toSubtitleTimeline);

export { toSubtitleTimeline, toSubtitleTimelines };
