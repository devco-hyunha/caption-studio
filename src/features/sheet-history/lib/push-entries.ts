import { cloneTimeline } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { SheetCursor } from '@/shared/types/sheet-cursor';
import type { HistoryCommand, HistoryEntry, HistoryTimelinePatch } from '../types';

/**
 * 단건 update 엔트리 — before/after clone + current 커서.
 * use-sheets·selection(U5)·time nudgeFocusedCell 공유.
 */
const buildUpdateEntry = (
  id: number,
  before: SheetTimelineItem,
  after: SheetTimelineItem,
  current: SheetCursor,
): HistoryEntry => ({
  command: 'update',
  id,
  before: cloneTimeline(before),
  after: cloneTimeline(after),
  current,
});

/**
 * multi currents — backup 인덱스로 after 시트 timelines 스냅샷을 수집.
 * clip·time multi 경로 공유.
 */
const buildCurrents = (
  backups: readonly HistoryTimelinePatch[],
  timelines: readonly SheetTimelineItem[],
): HistoryTimelinePatch[] =>
  backups.flatMap(({ index }) => {
    const timeline = timelines[index];
    if (!timeline) return [];
    return [{ index, data: cloneTimeline(timeline) }];
  });

/**
 * multi 엔트리 — command·before(backups)·after(currents)·current 커서.
 * clip·time multi 경로 공유.
 */
const buildMultiEntry = (
  command: HistoryCommand,
  backups: HistoryTimelinePatch[],
  currents: HistoryTimelinePatch[],
  current: SheetCursor,
): HistoryEntry => ({
  command,
  id: null,
  before: backups,
  after: currents,
  current,
});

export { buildCurrents, buildMultiEntry, buildUpdateEntry };
