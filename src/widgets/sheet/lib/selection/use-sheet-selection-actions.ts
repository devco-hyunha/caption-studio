import { cloneTimeline, createEmptyTimeline, useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import {
  rebuildVideoTimeSlotsFromActiveSheet,
  syncVideoTimeSlotsAfterInsert,
  syncVideoTimeSlotsAfterRemove,
} from '@/features/video-sync';
import { resolveFocusCursor } from '../focus/resolve-focus-cursor';
import { usePendingFocus } from '../focus/use-pending-focus';
import type { SheetCursor } from '@/shared/types/sheet-cursor';
import type { UseSheetSelectionActionsParams, UseSheetSelectionActionsResult } from '../../types';

/** 다중 선택 상태 + 행 CRUD 조립(스토어 셀렉터, pending focus, history push) */
const useSheetSelectionActions = ({
  format,
  rows,
  totalHeight,
  isEditing,
  currentRowIndex,
  currentColumn,
  endEdit,
  applyFocus,
  closeSearchPanel,
}: UseSheetSelectionActionsParams): UseSheetSelectionActionsResult => {
  const multipleActive = useSheetStore(
    (state) => state.sheets[state.active]?.multipleActive === true,
  );
  const toggleMultipleAction = useSheetStore((state) => state.toggleMultiple);
  const toggleSelectedRowAction = useSheetStore((state) => state.toggleSelectedRow);
  const setMultipleStartAction = useSheetStore((state) => state.setMultipleStart);
  const insertTimelineAfterAction = useSheetStore((state) => state.insertTimelineAfter);
  const removeTimelineAtAction = useSheetStore((state) => state.removeTimelineAt);

  const { focusAfter } = usePendingFocus({ format, rows, totalHeight, applyFocus });

  /** 포커스 기준 커서 — 셀 포커스가 없으면 첫 행·첫 열 */
  const resolveFocus = () => resolveFocusCursor(format, currentRowIndex, currentColumn);

  // current.row = 삽입된 행(insertIndex) — undo/redo 포커스 스냅샷이 삽입 위치와 일치
  const pushInsertHistory = (insertIndex: number, focusCol: number) => {
    const store = useSheetStore.getState();
    const after = store.sheets[store.active]?.timelines[insertIndex];
    if (!after) return;
    useSheetHistoryStore.getState().pushHistory({
      command: 'insert',
      id: insertIndex,
      before: null,
      after: cloneTimeline(after),
      current: { row: insertIndex, col: focusCol },
    });
  };

  /** Tab이 마지막 행 아래로 나간 경우: 커서 행 뒤에 행 삽입 */
  const handleAppendRow = (cursor: SheetCursor) => {
    closeSearchPanel();
    const insertIndex = insertTimelineAfterAction(cursor.row, format);
    if (insertIndex == null) return;
    syncVideoTimeSlotsAfterInsert(insertIndex);
    pushInsertHistory(insertIndex, cursor.col);
    focusAfter(insertIndex, cursor.col);
  };

  /** 행 이동 통보(화살표) — 다중 선택 중일 때만. Shift: 선택 확장, 그 외: 앵커 이동 */
  const handleRowMoved = (row: number, withShift: boolean) => {
    const state = useSheetStore.getState();
    const active = state.sheets[state.active];
    if (!active?.multipleActive) return;
    if (withShift) {
      toggleSelectedRowAction(row, true);
      return;
    }
    setMultipleStartAction(row);
  };

  /** Space — 다중 선택 중 현재 행 추가/해제. 다중 선택 밖에서는 no-op */
  const handleSpaceToggle = (row: number) => {
    const state = useSheetStore.getState();
    const active = state.sheets[state.active];
    if (!active?.multipleActive) return;
    toggleSelectedRowAction(row, false);
  };

  /** 행 추가: 포커스 행 바로 아래 삽입 후 그 행으로 포커스 */
  const handleInsertAtFocus = () => {
    if (isEditing()) endEdit(true);
    closeSearchPanel();
    const { row, col } = resolveFocus();
    const insertIndex = insertTimelineAfterAction(row, format);
    if (insertIndex == null) return;
    syncVideoTimeSlotsAfterInsert(insertIndex);
    pushInsertHistory(insertIndex, col);
    focusAfter(insertIndex, col);
  };

  /** 행 삭제: 포커스 행 삭제 후 삭제된 위치(또는 이전 행)로 포커스 */
  const handleRemoveAtFocus = () => {
    if (isEditing()) endEdit(true);
    closeSearchPanel();
    const { row, col } = resolveFocus();
    const store = useSheetStore.getState();
    const sheet = store.sheets[store.active];
    const before = sheet?.timelines[row];
    if (!before) return;
    const beforeSnap = cloneTimeline(before);
    const wasLast = (sheet?.timelines.length ?? 0) <= 1;

    const focusRow = removeTimelineAtAction(row);
    if (focusRow == null) return;

    // U5: lastIndex===0이면 update(EMPTY)로 대체 (행 유지)
    if (wasLast) {
      rebuildVideoTimeSlotsFromActiveSheet();
      useSheetHistoryStore.getState().pushHistory({
        command: 'update',
        id: row,
        before: beforeSnap,
        after: createEmptyTimeline(),
        current: { row, col },
      });
    } else {
      syncVideoTimeSlotsAfterRemove(row);
      useSheetHistoryStore.getState().pushHistory({
        command: 'remove',
        id: row,
        before: beforeSnap,
        after: null,
        current: { row, col },
      });
    }
    focusAfter(focusRow, col);
  };

  /** 다중 선택 툴바 클릭: 편집 커밋 후 다중 선택 on/off (on 시 포커스 행이 앵커) */
  const handleToggleMultipleClick = () => {
    if (isEditing()) endEdit(true);
    toggleMultipleAction(resolveFocus().row);
  };

  return {
    multipleActive,
    handleAppendRow,
    handleRowMoved,
    handleSpaceToggle,
    handleInsertAtFocus,
    handleRemoveAtFocus,
    handleToggleMultipleClick,
  };
};

export { useSheetSelectionActions };
