import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import type { SheetRowView } from '../../types';
import { useSheetUndoActions } from './use-sheet-undo-actions';

const ROW_HEIGHT = 24;

const makeRow = (index: number): SheetRowView => ({
  index,
  starttime: '00:00:00.000',
  endtime: '00:00:00.000',
  dur: '00:00:00.000',
  text: '',
  memo: '',
  height: ROW_HEIGHT,
});

const makeRows = (count: number) => Array.from({ length: count }, (_, index) => makeRow(index));

const resetSheets = (count: number) => {
  useSheetStore.setState({
    active: 0,
    sheets: [
      {
        name: 'sheet1',
        timelines: Array.from({ length: count }, () => ({
          start: 0,
          end: 0,
          text: '',
          memo: '',
        })),
        smiName: '',
        smiLang: '',
        scroll: 0,
        current: {},
        selectedRows: [],
        multipleActive: false,
        multipleStart: null,
      },
    ],
  });
};

const renderUndo = (
  rowCount: number,
  overrides: Partial<Parameters<typeof useSheetUndoActions>[0]> = {},
) => {
  resetSheets(rowCount);
  useSheetHistoryStore.getState().resetForSheets(1, 0);
  const applyFocus = vi.fn();
  const isEditing = vi.fn(() => false);
  const closeSearchPanel = vi.fn(() => useSheetSearchStore.getState().closeSearchPanel());
  const initialProps = {
    format: 'smi' as const,
    rows: makeRows(rowCount),
    totalHeight: rowCount * ROW_HEIGHT,
    isEditing,
    applyFocus,
    closeSearchPanel,
    ...overrides,
  };
  const hook = renderHook(
    (props: Parameters<typeof useSheetUndoActions>[0]) => useSheetUndoActions(props),
    { initialProps },
  );
  const rerender = (rowCount: number, totalHeight = rowCount * ROW_HEIGHT) =>
    hook.rerender({
      format: 'smi',
      rows: makeRows(rowCount),
      totalHeight,
      isEditing,
      applyFocus,
      closeSearchPanel,
    });
  return { hook, applyFocus, isEditing, closeSearchPanel, rerender };
};

describe('useSheetUndoActions', () => {
  beforeEach(() => {
    resetSheets(3);
    useSheetHistoryStore.getState().resetForSheets(1, 0);
  });

  it('에딧 중 handleUndo/handleRedo는 no-op — 스토어 undo 미호출', () => {
    const { hook, applyFocus } = renderUndo(3, { isEditing: () => true });

    act(() => hook.result.current.handleUndo());
    act(() => hook.result.current.handleRedo());
    expect(applyFocus).not.toHaveBeenCalled();
  });

  it('handleUndo — 검색 패널 close 후 pending focus가 렌더 반영 시 applyFocus', () => {
    useSheetSearchStore.setState({ searchPanelOpen: true, searchHits: [{ row: 0, col: 1 }] });

    const { hook, applyFocus, rerender } = renderUndo(3, { totalHeight: 10 });

    act(() => hook.result.current.handleUndo());
    // 스택 비어 있음 → focus 없음 → applyFocus 보류
    expect(useSheetSearchStore.getState().searchPanelOpen).toBe(false);
    expect(applyFocus).not.toHaveBeenCalled();

    rerender(3);
  });

  it('undo 성공 시 렌더 반영 후 applyFocus (미반영 시 보류)', () => {
    const { hook, applyFocus, rerender } = renderUndo(2, { totalHeight: 10 });

    // insert entry push → undo 시 행 제거 + focusRow 반환
    useSheetStore.getState().spliceTimelineAt(2, { start: 0, end: 0, text: 'C', memo: '' });
    useSheetHistoryStore.getState().pushHistory({
      command: 'insert',
      id: 2,
      before: null,
      after: { start: 0, end: 0, text: 'C', memo: '' },
      current: { row: 1, col: 0 },
    });

    act(() => hook.result.current.handleUndo());
    // totalHeight가 새 행 수를 반영하지 못하면 보류
    expect(applyFocus).not.toHaveBeenCalled();

    rerender(2);
    // smi editable col 0 = starttime
    expect(applyFocus).toHaveBeenCalledWith(1, 'starttime');
  });

  it('canUndo/canRedo는 스택 상태 반영', () => {
    const { hook } = renderUndo(2);
    expect(hook.result.current.canUndo).toBe(false);
    expect(hook.result.current.canRedo).toBe(false);

    act(() => {
      useSheetHistoryStore.getState().pushHistory({
        command: 'update',
        id: 0,
        before: { start: 0, end: 0, text: 'A', memo: '' },
        after: { start: 0, end: 0, text: 'B', memo: '' },
        current: { row: 0, col: 0 },
      });
    });
    expect(hook.result.current.canUndo).toBe(true);
    expect(hook.result.current.canRedo).toBe(false);
  });
});
