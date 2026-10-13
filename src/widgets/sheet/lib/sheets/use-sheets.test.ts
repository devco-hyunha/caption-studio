import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import { useSheets } from './use-sheets';

const resetSheets = (count: number) => {
  useSheetStore.setState({
    active: 0,
    sheets: Array.from({ length: count }, (_, index) => ({
      name: `sheet${index + 1}`,
      timelines: [{ start: 0, end: 1000, text: 'A', memo: '' }],
      smiName: '',
      smiLang: '',
      scroll: 0,
      current: {},
      selectedRows: [],
      multipleActive: false,
      multipleStart: null,
    })),
  });
};

const resetSearch = () => {
  useSheetSearchStore.setState({
    searchPanelOpen: true,
    searchHits: [{ row: 0, col: 1 }],
    searchCurrent: 0,
    searchInputFocused: false,
    errorSearchActive: false,
  });
};

describe('useSheets clearSearchHits', () => {
  beforeEach(() => {
    resetSheets(2);
    resetSearch();
  });

  it('탭 전환 — hits·current clear, panel은 유지', () => {
    const { result } = renderHook(() => useSheets('smi'));

    act(() => result.current.handleSelectTab(1));
    const state = useSheetSearchStore.getState();
    expect(state.searchHits).toEqual([]);
    expect(state.searchCurrent).toBe(-1);
    expect(state.searchPanelOpen).toBe(true);
  });

  it('탭 추가·복사·삭제 — hits clear', () => {
    const { result } = renderHook(() => useSheets('smi'));

    act(() => result.current.handleAddTab());
    expect(useSheetSearchStore.getState().searchHits).toEqual([]);

    resetSearch();
    act(() => result.current.handleCopyTab(0));
    expect(useSheetSearchStore.getState().searchHits).toEqual([]);

    resetSearch();
    act(() => result.current.handleDeleteTab(1));
    expect(useSheetSearchStore.getState().searchHits).toEqual([]);
  });

  it('같은 탭 재선택 — hits 유지', () => {
    const { result } = renderHook(() => useSheets('smi'));

    act(() => result.current.handleSelectTab(0));
    expect(useSheetSearchStore.getState().searchHits).toEqual([{ row: 0, col: 1 }]);
  });

  it('handleUpdateCell push shape — command update·before/after 스냅샷·current col', () => {
    useSheetHistoryStore.getState().resetForSheets(2, 0);
    const { result } = renderHook(() => useSheets('smi'));

    act(() => result.current.handleUpdateCell(0, 'text', 'X'));
    const stack = useSheetHistoryStore.getState().stacks[0];
    const last = stack.entries[stack.index];
    expect(last?.command).toBe('update');
    expect(last?.id).toBe(0);
    expect(last?.before).toEqual({ start: 0, end: 1000, text: 'A', memo: '' });
    expect(last?.after).toEqual({ start: 0, end: 1000, text: 'X', memo: '' });
    expect(last?.current).toEqual({ row: 0, col: 1 });
  });
});
