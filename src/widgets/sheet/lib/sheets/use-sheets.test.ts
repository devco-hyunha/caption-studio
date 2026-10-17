import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import type { ConfirmOptions } from '@/shared/types/confirm';
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

const closeSearchPanel = () => useSheetSearchStore.getState().closeSearchPanel();

/** confirm 스텁 — success를 즉시 실행 (confirm 셸은 shared/ui에서 별도 검증) */
const confirmNow = (options: ConfirmOptions) => {
  options.success?.();
};

describe('useSheets clearSearchHits', () => {
  beforeEach(() => {
    resetSheets(2);
    resetSearch();
  });

  it('탭 전환 — hits·current clear, panel은 유지', () => {
    const { result } = renderHook(() => useSheets('smi', closeSearchPanel, confirmNow));

    act(() => result.current.handleSelectTab(1));
    const state = useSheetSearchStore.getState();
    expect(state.searchHits).toEqual([]);
    expect(state.searchCurrent).toBe(-1);
    expect(state.searchPanelOpen).toBe(true);
  });

  it('탭 추가·복사·삭제 — hits clear', () => {
    const { result } = renderHook(() => useSheets('smi', closeSearchPanel, confirmNow));

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
    const { result } = renderHook(() => useSheets('smi', closeSearchPanel, confirmNow));

    act(() => result.current.handleSelectTab(0));
    expect(useSheetSearchStore.getState().searchHits).toEqual([{ row: 0, col: 1 }]);
  });

  it('handleUpdateCell push shape — command update·before/after 스냅샷·current col', () => {
    useSheetHistoryStore.getState().resetForSheets(2, 0);
    const { result } = renderHook(() => useSheets('smi', closeSearchPanel, confirmNow));

    act(() => result.current.handleUpdateCell(0, 'text', 'X'));
    const stack = useSheetHistoryStore.getState().stacks[0];
    const last = stack.entries[stack.index];
    expect(last?.command).toBe('update');
    expect(last?.id).toBe(0);
    expect(last?.before).toEqual({ start: 0, end: 1000, text: 'A', memo: '' });
    expect(last?.after).toEqual({ start: 0, end: 1000, text: 'X', memo: '' });
    expect(last?.current).toEqual({ row: 0, col: 1 });
  });

  it('handleUpdateCell — mutate 전 검색 패널 close', () => {
    useSheetHistoryStore.getState().resetForSheets(2, 0);
    resetSearch();
    const { result } = renderHook(() => useSheets('smi', closeSearchPanel, confirmNow));

    act(() => result.current.handleUpdateCell(0, 'text', 'X'));
    expect(useSheetSearchStore.getState().searchPanelOpen).toBe(false);
  });
});

describe('useSheets 마지막 탭 삭제 — clearActive', () => {
  beforeEach(() => {
    resetSheets(1);
    resetSearch();
  });

  it('마지막 탭 — lastTitle confirm, success 시 탭 유지·timelines 빈 행 1개·history reset', () => {
    const captured: ConfirmOptions[] = [];
    const { result } = renderHook(() =>
      useSheets('smi', closeSearchPanel, (options) => captured.push(options)),
    );

    act(() => result.current.handleDeleteTab(0));

    // ko 사전에서 last·delete title 모두 '시트 삭제' — content로 분기 구분
    expect(captured[0]?.content).toBe('시트가 초기화 됩니다.<br />계속하시겠습니까?');
    expect(useSheetStore.getState().sheets.length).toBe(1);

    act(() => captured[0]?.success?.());
    const sheet = useSheetStore.getState().sheets[0];
    expect(sheet.timelines).toEqual([{ start: 0, end: 0, text: '', memo: '' }]);
    expect(sheet.scroll).toBe(0);
    expect(useSheetHistoryStore.getState().stacks[0].entries.length).toBe(0);
  });

  it('cancel — 초기화되지 않음', () => {
    const captured: ConfirmOptions[] = [];
    const { result } = renderHook(() =>
      useSheets('smi', closeSearchPanel, (options) => captured.push(options)),
    );

    act(() => result.current.handleDeleteTab(0));
    captured[0]?.cancel?.();

    expect(useSheetStore.getState().sheets[0].timelines).toEqual([
      { start: 0, end: 1000, text: 'A', memo: '' },
    ]);
  });

  it('2 탭 이상 — deleteTitle confirm 후 탭 제거', () => {
    resetSheets(2);
    const captured: ConfirmOptions[] = [];
    const { result } = renderHook(() =>
      useSheets('smi', closeSearchPanel, (options) => captured.push(options)),
    );

    act(() => result.current.handleDeleteTab(1));

    expect(captured[0]?.content).toBe(
      '이 시트를 삭제하시겠습니까? 시트 내용은 복구할 수 없습니다.',
    );
    act(() => captured[0]?.success?.());
    expect(useSheetStore.getState().sheets.length).toBe(1);
  });
});
