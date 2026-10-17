import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SheetTimelineItem, SheetsState } from '@/entities/subtitle-sheet';
import { formatTime } from '@/shared/lib/timecode';
import { asHtmlString } from '@/shared/lib/utils';
import type { SheetRowView, SheetTabView } from '../../types';
import { calcRowHeight } from '../columns/row-height';

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

/**
 * 타임라인 → 행 뷰.
 * SMI: dur는 **다음 행 start − start**. 마지막 행은 dur 빈값.
 * SRT: storedEnd 우선, dur = storedEnd − start.
 */
const mapTimelinesToRows = (
  timelines: SheetTimelineItem[],
  format: SubtitleFormat,
  selectedRows: readonly number[] = [],
): SheetRowView[] => {
  const selectedSet = new Set(selectedRows);
  const isSmi = format === 'smi';

  return timelines.map((timeline, index, list) => {
    const start = resolveStart(timeline);
    const nextStart = list[index + 1] ? resolveStart(list[index + 1]) : undefined;
    const hasNext = index < list.length - 1;
    const storedEnd = Number(timeline.end);

    const end = isSmi
      ? hasNext
        ? (nextStart as number)
        : start
      : Number.isFinite(storedEnd)
        ? storedEnd
        : Number.isFinite(nextStart)
          ? (nextStart as number)
          : start;

    const dur = isSmi && !hasNext ? '' : formatDurationSec(start, end);

    // errorRows — SMI: start > nextStart. SRT: end > nextStart · end < start
    const isError = isSmi
      ? hasNext && start > (nextStart as number)
      : (hasNext && storedEnd > (nextStart as number)) || storedEnd < start;

    const text = asHtmlString(timeline.text);

    return {
      index,
      starttime: formatTime(start),
      endtime: formatTime(end),
      dur,
      text,
      memo: asHtmlString(timeline.memo),
      height: calcRowHeight(text),
      isSelected: selectedSet.has(index),
      isError,
    };
  });
};

/** 활성 시트의 행 뷰 (다중 선택 반영) */
const getActiveSheetRows = (state: SheetsState, format: SubtitleFormat): SheetRowView[] => {
  const sheet = state.sheets[state.active] ?? state.sheets[0];
  if (!sheet) return mapTimelinesToRows([], format);
  return mapTimelinesToRows(sheet.timelines, format, sheet.selectedRows);
};

const toSheetTabs = (sheets: SheetsState['sheets']): SheetTabView[] =>
  sheets.map((sheet) => ({ name: sheet.name }));

export { getActiveSheetRows, mapTimelinesToRows, toSheetTabs };
