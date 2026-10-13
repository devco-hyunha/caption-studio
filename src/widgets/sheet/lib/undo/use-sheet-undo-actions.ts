import {
  canRedo as canRedoStack,
  canUndo as canUndoStack,
  useSheetHistoryStore,
} from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import { rebuildVideoTimeSlotsFromActiveSheet } from '@/features/video-sync';
import { usePendingFocus } from '../focus/use-pending-focus';
import type { UseSheetUndoActionsParams, UseSheetUndoActionsResult } from '../../types';

/**
 * undo/redo 조립 — 스토어 undo/redo + pending focus.
 * sheet-body에 핸들러 누적 금지 (R5).
 */
const useSheetUndoActions = ({
  format,
  rows,
  totalHeight,
  isEditing,
  applyFocus,
}: UseSheetUndoActionsParams): UseSheetUndoActionsResult => {
  const canUndo = useSheetHistoryStore((state) => {
    const stack = state.stacks[state.activeSheetIndex];
    return stack ? canUndoStack(stack) : false;
  });
  const canRedo = useSheetHistoryStore((state) => {
    const stack = state.stacks[state.activeSheetIndex];
    return stack ? canRedoStack(stack) : false;
  });

  const { focusAfter } = usePendingFocus({ format, rows, totalHeight, applyFocus });

  const handleUndo = () => {
    if (isEditing()) return;
    useSheetSearchStore.getState().closeSearchPanel();
    const focus = useSheetHistoryStore.getState().undo();
    if (!focus) return;
    rebuildVideoTimeSlotsFromActiveSheet();
    focusAfter(focus.row, focus.col);
  };

  const handleRedo = () => {
    if (isEditing()) return;
    useSheetSearchStore.getState().closeSearchPanel();
    const focus = useSheetHistoryStore.getState().redo();
    if (!focus) return;
    rebuildVideoTimeSlotsFromActiveSheet();
    focusAfter(focus.row, focus.col);
  };

  return { canUndo, canRedo, handleUndo, handleRedo };
};

export { useSheetUndoActions };
