import { cloneTimeline, useSheetStore } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore, type HistoryTimelinePatch } from '@/features/sheet-history';
import {
  getVideoPlayerControlApi,
  rebuildVideoTimeSlotsFromActiveSheet,
  syncVideoTimeSlotsAfterRowTimeEdit,
} from '@/features/video-sync';
import { formatTime, secondsToMs } from '@/shared/lib/timecode';
import type {
  SheetColumnId,
  UseSheetTimeActionsParams,
  UseSheetTimeActionsResult,
} from '../../types';
import { isMultipleActive } from '../selection/is-multiple-active';
import { resolveFocusCursor } from '../focus/resolve-focus-cursor';
import { nudgeTimelineByStep, nudgeTimelineColumn, readTimeJumpMs } from './time-jump';

/** time 열 타깃 — starttime/endtime만 */
const isTimeColumnPair = (
  column: SheetColumnId | null | undefined,
): column is 'starttime' | 'endtime' => column === 'starttime' || column === 'endtime';

/**
 * 시트 time ±jump 동작 API — Ctrl+Plus/Minus.
 * 다중 선택은 선택 행 start/end 일괄, 단건은 포커스 time 열만. jump는 `jump_val`(기본 30ms).
 */
const useSheetTimeActions = ({
  format,
  currentRowIndex,
  currentColumn,
  isTimeTarget,
  isEditing,
  closeSearchPanel,
  onUpdateCell,
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
    rebuildVideoTimeSlotsFromActiveSheet();
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

    const after = useSheetStore.getState().sheets[store.active]?.timelines[currentRowIndex] ?? next;
    const focus = resolveFocusCursor(format, currentRowIndex, currentColumn);
    useSheetHistoryStore.getState().pushHistory({
      command: 'update',
      id: currentRowIndex,
      before: beforeSnap,
      after: cloneTimeline(after),
      current: focus,
    });
    syncVideoTimeSlotsAfterRowTimeEdit(currentRowIndex);
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

  /** Ctrl+` · 「시간 입력」 — 플레이어 시각을 포커스 start/end 셀에 커밋 */
  const timeCarve = () => {
    if (isEditing()) return;
    if (isMultipleActive()) return;
    if (!isTimeTarget() || !isTimeColumnPair(currentColumn) || currentRowIndex == null) return;

    const seconds = getVideoPlayerControlApi()?.getCurrentTime();
    if (seconds == null || !Number.isFinite(seconds)) return;

    closeSearchPanel();
    onUpdateCell(currentRowIndex, currentColumn, formatTime(secondsToMs(seconds)));
  };

  return { timePlus, timeMinus, timeCarve };
};

export { useSheetTimeActions, isTimeColumnPair };
