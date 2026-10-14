import type { SheetCursor } from '@/shared/types/sheet-cursor';
import { useSheetStore, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { HistoryEntry, HistoryTimelinePatch } from '../types';

const isTimelineItem = (value: unknown): value is SheetTimelineItem =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPatchList = (value: unknown): value is HistoryTimelinePatch[] => Array.isArray(value);

/** history undo update 가드 — JSON.stringify 동등 */
const timelineSnapshotEquals = (
  left: SheetTimelineItem | null | undefined,
  right: SheetTimelineItem | null | undefined,
): boolean => JSON.stringify(left) === JSON.stringify(right);

/** multi entry의 counterpart patch 배열 — 배열이 아니면 빈 배열 */
const counterpartPatches = (value: SheetTimelineItem | HistoryTimelinePatch[] | null) =>
  isPatchList(value) ? value : [];

/** multi 패치 적용 전 가드 — 각 patch 행의 현재 snapshot이 기대값과 같아야 한다(M1) */
const patchesMatchSnapshots = (
  patches: readonly HistoryTimelinePatch[],
  expected: readonly HistoryTimelinePatch[],
): boolean => {
  const sheet = useSheetStore.getState().sheets[useSheetStore.getState().active];
  if (!sheet) return false;
  return expected.every(({ index, data }) => timelineSnapshotEquals(sheet.timelines[index], data));
};

/**
 * undo — entry before로 복원 + `move.event`에 해당하는 포커스 반환.
 * insert undo → remove 후 clamp된 행.
 */
const applyHistoryUndo = (entry: HistoryEntry): SheetCursor | null => {
  const store = useSheetStore.getState();
  const col = entry.current.col;

  if (entry.command.startsWith('multi.')) {
    if (!isPatchList(entry.before)) return null;
    // M1: multi 실행 후 행 CRUD로 인덱스가 어긋나면 적용하지 않는다 (U1: 스택은 소비)
    if (!patchesMatchSnapshots(entry.before, counterpartPatches(entry.after))) return null;
    if (!store.replaceTimelinePatches(entry.before)) return null;
    return { row: entry.current.row, col };
  }

  if (entry.command === 'insert') {
    if (entry.id == null) return null;
    // M5: multipleActive 게이트 없는 undo 전용 제거
    const focusRow = store.removeTimelineAtForHistory(entry.id);
    if (focusRow == null) return null;
    return { row: focusRow, col };
  }

  if (entry.command === 'remove') {
    if (entry.id == null || !isTimelineItem(entry.before)) return null;
    if (!store.spliceTimelineAt(entry.id, entry.before)) return null;
    return { row: entry.id, col };
  }

  if (entry.command === 'update') {
    if (entry.id == null || !isTimelineItem(entry.before) || !isTimelineItem(entry.after)) {
      return null;
    }
    const sheet = store.sheets[store.active];
    const current = sheet?.timelines[entry.id];
    // timelines[id] === after 일 때만 복원
    if (!timelineSnapshotEquals(current, entry.after)) return null;
    if (!store.patchActiveTimeline(entry.id, entry.before)) return null;
    return { row: entry.current.row, col };
  }

  return null;
};

/**
 * redo — entry after 재적용 + 포커스.
 * insert redo → 삽입된 행으로 이동.
 */
const applyHistoryRedo = (entry: HistoryEntry): SheetCursor | null => {
  const store = useSheetStore.getState();
  const col = entry.current.col;

  if (entry.command.startsWith('multi.')) {
    if (!isPatchList(entry.after)) return null;
    // M1: redo 전 patch 행이 undo된 상태(before)와 같아야 적용
    if (!patchesMatchSnapshots(entry.after, counterpartPatches(entry.before))) return null;
    if (!store.replaceTimelinePatches(entry.after)) return null;
    return { row: entry.current.row, col };
  }

  if (entry.command === 'insert') {
    if (entry.id == null || !isTimelineItem(entry.after)) return null;
    if (!store.spliceTimelineAt(entry.id, entry.after)) return null;
    return { row: entry.id, col };
  }

  if (entry.command === 'remove') {
    if (entry.id == null) return null;
    // M5: multipleActive 게이트 없는 undo 전용 제거
    const focusRow = store.removeTimelineAtForHistory(entry.id);
    if (focusRow == null) return null;
    return { row: focusRow, col };
  }

  if (entry.command === 'update') {
    if (entry.id == null || !isTimelineItem(entry.after)) return null;
    if (!store.patchActiveTimeline(entry.id, entry.after)) return null;
    return { row: entry.current.row, col };
  }

  return null;
};

export { applyHistoryRedo, applyHistoryUndo, timelineSnapshotEquals };
