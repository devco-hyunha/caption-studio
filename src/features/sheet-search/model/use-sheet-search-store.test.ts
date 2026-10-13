import { beforeEach, describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { ErrorRowLike } from '../types';
import { useSheetSearchStore } from './use-sheet-search-store';

const resetStore = () => {
  useSheetSearchStore.setState({
    searchPanelOpen: false,
    searchHits: [],
    searchCurrent: -1,
    searchInputFocused: false,
    errorSearchActive: false,
  });
};

const TIMELINES: SheetTimelineItem[] = [
  { text: 'Hello World', memo: '' },
  { text: 'other', memo: 'hello memo' },
];

describe('useSheetSearchStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('toggleSearchPanel — 열리고 닫힘. 닫을 때 hits·current·error 초기화', () => {
    useSheetSearchStore.getState().toggleSearchPanel();
    expect(useSheetSearchStore.getState().searchPanelOpen).toBe(true);

    useSheetSearchStore.setState({ searchHits: [{ row: 0, col: 1 }], searchCurrent: 0 });
    useSheetSearchStore.getState().toggleSearchPanel();

    const state = useSheetSearchStore.getState();
    expect(state.searchPanelOpen).toBe(false);
    expect(state.searchHits).toEqual([]);
    expect(state.searchCurrent).toBe(-1);
  });

  it('closeSearchPanel — 열려 있을 때만 닫고 hits·current 초기화. 닫히면 무변화', () => {
    useSheetSearchStore.setState({
      searchPanelOpen: true,
      searchHits: [{ row: 0, col: 1 }],
      searchCurrent: 0,
    });
    useSheetSearchStore.getState().closeSearchPanel();

    const state = useSheetSearchStore.getState();
    expect(state.searchPanelOpen).toBe(false);
    expect(state.searchHits).toEqual([]);
    expect(state.searchCurrent).toBe(-1);

    // 이미 닫힘 — hits 유지(무변화)
    useSheetSearchStore.setState({ searchHits: [{ row: 1, col: 2 }], searchCurrent: 0 });
    useSheetSearchStore.getState().closeSearchPanel();
    expect(useSheetSearchStore.getState().searchHits).toEqual([{ row: 1, col: 2 }]);
  });

  it('clearSearchHits — hits·current만 비움 (panel은 유지)', () => {
    useSheetSearchStore.setState({
      searchPanelOpen: true,
      searchHits: [{ row: 0, col: 1 }],
      searchCurrent: 0,
    });
    useSheetSearchStore.getState().clearSearchHits();

    const state = useSheetSearchStore.getState();
    expect(state.searchPanelOpen).toBe(true);
    expect(state.searchHits).toEqual([]);
    expect(state.searchCurrent).toBe(-1);
  });

  it('runSearch — 매치·첫 hit 반환·current=0. 매치 없으면 null·current=-1', () => {
    const hit = useSheetSearchStore.getState().runSearch('hello', TIMELINES, 'smi');
    expect(hit).toEqual({ row: 0, col: 1 });
    const state = useSheetSearchStore.getState();
    expect(state.searchHits).toEqual([
      { row: 0, col: 1 },
      { row: 1, col: 2 },
    ]);
    expect(state.searchCurrent).toBe(0);

    const none = useSheetSearchStore.getState().runSearch('zzz', TIMELINES, 'smi');
    expect(none).toBeNull();
    expect(useSheetSearchStore.getState().searchCurrent).toBe(-1);
  });

  it('toggleErrorSearch — 체크 시 errorRows hits·첫 hit 반환, 해제 시 빈 hits·null', () => {
    const rows: ErrorRowLike[] = [
      { index: 0, isError: true },
      { index: 1, isError: false },
      { index: 2, isError: true },
    ];

    const hit = useSheetSearchStore.getState().toggleErrorSearch(rows);
    expect(hit).toEqual({ row: 0, col: 0 });
    const state = useSheetSearchStore.getState();
    expect(state.errorSearchActive).toBe(true);
    expect(state.searchHits).toEqual([
      { row: 0, col: 0 },
      { row: 2, col: 0 },
    ]);

    const off = useSheetSearchStore.getState().toggleErrorSearch(rows);
    expect(off).toBeNull();
    expect(useSheetSearchStore.getState().errorSearchActive).toBe(false);
    expect(useSheetSearchStore.getState().searchHits).toEqual([]);
  });

  it('searchStep — next/prev 이동 후 점프할 hit. 경계·hits 없으면 null', () => {
    useSheetSearchStore.setState({
      searchHits: [
        { row: 0, col: 1 },
        { row: 1, col: 2 },
      ],
      searchCurrent: 0,
    });

    const next = useSheetSearchStore.getState().searchStep('next');
    expect(next).toEqual({ row: 1, col: 2 });
    expect(useSheetSearchStore.getState().searchCurrent).toBe(1);

    const prev = useSheetSearchStore.getState().searchStep('prev');
    expect(prev).toEqual({ row: 0, col: 1 });

    // 경계 prev — 클램프(첫 hit 유지)
    const boundary = useSheetSearchStore.getState().searchStep('prev');
    expect(boundary).toEqual({ row: 0, col: 1 });

    // hits 없음 — null
    useSheetSearchStore.setState({ searchHits: [], searchCurrent: -1 });
    expect(useSheetSearchStore.getState().searchStep('next')).toBeNull();
  });

  it('canSearchPrev/Next — 경계·hits 유무로 prev/next 가능 판별', () => {
    useSheetSearchStore.setState({
      searchHits: [
        { row: 0, col: 1 },
        { row: 1, col: 2 },
      ],
      searchCurrent: 0,
    });
    expect(useSheetSearchStore.getState().canSearchPrev()).toBe(false);
    expect(useSheetSearchStore.getState().canSearchNext()).toBe(true);

    useSheetSearchStore.setState({ searchCurrent: 1 });
    expect(useSheetSearchStore.getState().canSearchPrev()).toBe(true);
    expect(useSheetSearchStore.getState().canSearchNext()).toBe(false);

    useSheetSearchStore.setState({ searchHits: [], searchCurrent: -1 });
    expect(useSheetSearchStore.getState().canSearchPrev()).toBe(false);
    expect(useSheetSearchStore.getState().canSearchNext()).toBe(false);
  });
});
