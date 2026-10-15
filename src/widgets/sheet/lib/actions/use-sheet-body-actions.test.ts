import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import type { SheetRowView, UseSheetCellEditResult } from '../../types';
import { useSheetBodyActions } from './use-sheet-body-actions';

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

const resetStore = (rowCount: number) => {
  useSheetStore.setState({
    active: 0,
    sheets: [
      {
        name: 'sheet1',
        timelines: Array.from({ length: rowCount }, () => ({
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
  useSheetSearchStore.setState({
    searchPanelOpen: false,
    searchHits: [],
    searchCurrent: -1,
    searchInputFocused: false,
    errorSearchActive: false,
  });
};

const makeCellEdit = (overrides: Partial<UseSheetCellEditResult> = {}): UseSheetCellEditResult => ({
  mode: 'hidden',
  target: null,
  inputRef: { current: null },
  wrapRef: { current: null },
  currentRowIndex: 1,
  currentColumn: 'text',
  isEditing: vi.fn(() => false),
  isTextTarget: vi.fn(() => true),
  isTimeTarget: vi.fn(() => false),
  hasFocus: vi.fn(() => true),
  endEdit: vi.fn(),
  beginEdit: vi.fn(),
  cancelEdit: vi.fn(),
  beginEditFromTyping: vi.fn(),
  insertEditorLineBreak: vi.fn(),
  applyFocus: vi.fn(),
  cellEvents: {
    onCellClick: vi.fn(),
    onCellDoubleClick: vi.fn(),
    onCellContextMenu: vi.fn(),
  },
  inputEvents: {
    onInputKeyDown: vi.fn(),
    onInputClick: vi.fn(),
    onInputBlur: vi.fn(),
  },
  ...overrides,
});

const renderActions = (
  rowCount: number,
  cellEditOverrides: Partial<UseSheetCellEditResult> = {},
  searchHits: { row: number; col: number }[] = [],
) => {
  resetStore(rowCount);
  useSheetHistoryStore.getState().resetForSheets(1, 0);
  if (searchHits.length > 0) {
    useSheetSearchStore.setState({
      searchPanelOpen: true,
      searchHits,
      searchCurrent: 0,
    });
  }
  const cellEdit = makeCellEdit(cellEditOverrides);
  const closeSearchPanel = vi.fn();
  const isSearchPanelOpen = vi.fn(() => false);
  const onUpdateCell = vi.fn(() => true);
  const setScrollTop = vi.fn();
  const hook = renderHook(
    (props: Parameters<typeof useSheetBodyActions>[0]) => useSheetBodyActions(props),
    {
      initialProps: {
        format: 'smi' as const,
        rows: makeRows(rowCount),
        cellEdit,
        scrollRef: { current: null },
        totalHeight: rowCount * ROW_HEIGHT,
        setScrollTop,
        onUpdateCell,
        closeSearchPanel,
        isSearchPanelOpen,
      },
    },
  );
  return { hook, cellEdit, closeSearchPanel, isSearchPanelOpen, onUpdateCell, setScrollTop };
};

describe('useSheetBodyActions', () => {
  beforeEach(() => {
    resetStore(3);
  });

  it('search wiring — searchHitKeys 행/열 변환 (smi editable col)', () => {
    const { hook } = renderActions(3, {}, [
      { row: 0, col: 1 },
      { row: 1, col: 2 },
      { row: 5, col: 1 },
    ]);

    expect(hook.result.current.searchHitKeys).toEqual(new Set(['0:text', '1:memo']));
  });

  it('selection wiring — handleInsertAtFocus: 포커스 행 위치에 timeline 삽입 + history push', () => {
    const { hook } = renderActions(3);

    act(() => hook.result.current.handleInsertAtFocus());

    const timelines = useSheetStore.getState().sheets[0].timelines;
    expect(timelines.length).toBe(4);
    expect(useSheetHistoryStore.getState().canUndo()).toBe(true);
  });

  it('selection wiring — handleToggleMultipleClick: multipleActive 토글', () => {
    const { hook } = renderActions(3);

    expect(hook.result.current.multipleActive).toBe(false);
    act(() => hook.result.current.handleToggleMultipleClick());
    expect(hook.result.current.multipleActive).toBe(true);
  });

  it('undo wiring — canUndo/undo: history 스택 반영', () => {
    const { hook } = renderActions(3);

    expect(hook.result.current.canUndo).toBe(false);

    act(() => hook.result.current.handleInsertAtFocus());
    expect(hook.result.current.canUndo).toBe(true);

    act(() => hook.result.current.handleUndo());
    expect(useSheetStore.getState().sheets[0].timelines.length).toBe(3);
  });

  it('shortkey wiring — getShortkeyActions: composite 결과(clip·time·video·move·undo)가 actions에 연결', () => {
    const { hook, cellEdit } = renderActions(3);

    const actions = hook.result.current.getShortkeyActions();

    // move 훅 결과
    expect(actions.moveTabNext).toBeTypeOf('function');
    expect(actions.moveRowNext).toBeTypeOf('function');
    // clip·time·video wiring
    expect(actions.clipCopy).toBeTypeOf('function');
    expect(actions.timeCarve).toBeTypeOf('function');
    expect(actions.videoPlayToggle).toBeTypeOf('function');
    // undo/redo wiring
    expect(actions.undo).toBeTypeOf('function');
    expect(actions.redo).toBeTypeOf('function');
    // beginEdit는 cellEdit 결과 그대로
    expect(actions.beginEdit).toBe(cellEdit.beginEdit);
  });

  it('shortkey wiring — toggleRowSelect: 다중 선택 중 currentRowIndex(1) Space 토글(해제)', () => {
    const { hook } = renderActions(3);
    useSheetStore.getState().toggleMultiple(1);
    // 앵커 행 1이 선택된 상태
    expect(useSheetStore.getState().sheets[0].selectedRows).toContain(1);

    const actions = hook.result.current.getShortkeyActions();
    act(() => actions.toggleRowSelect());

    // Space 토글 → 행 1 선택 해제
    expect(useSheetStore.getState().sheets[0].selectedRows).not.toContain(1);
  });

  it('time wiring — timeCarve: composite가 time 훅 결과 노출 (timeCarve 핸들러 등록용)', () => {
    const { hook } = renderActions(3);
    expect(hook.result.current.time.timeCarve).toBeTypeOf('function');
  });

  it('import wiring — handleImported: timelines 교체 + history reset + search clear + setScrollTop(0) + 포커스 row 0', () => {
    const { hook, cellEdit, setScrollTop } = renderActions(3, {}, [{ row: 0, col: 1 }]);

    act(() =>
      hook.result.current.handleImported([
        { start: 10, end: 20, text: 'new', memo: 'm' },
        { start: 30, end: 40, text: 'next', memo: '' },
      ]),
    );

    const timelines = useSheetStore.getState().sheets[0].timelines;
    expect(timelines.length).toBe(2);
    expect(timelines[0].text).toBe('new');
    // history·search 초기화
    expect(useSheetHistoryStore.getState().canUndo()).toBe(false);
    expect(useSheetSearchStore.getState().searchHits.length).toBe(0);
    // 스크롤 0 + 포커스 row 0 text
    expect(setScrollTop).toHaveBeenCalledWith(0);
    expect(cellEdit.endEdit).toHaveBeenCalledWith(false);
    expect(cellEdit.applyFocus).toHaveBeenCalledWith(0, 'text');
  });
});
