import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetClipActions } from './use-sheet-clip-actions';

const resetStore = () => {
  useSheetStore.setState({
    active: 0,
    sheets: [
      {
        name: 'sheet1',
        timelines: [
          { start: 0, end: 1000, text: 'A', memo: '' },
          { start: 1000, end: 2000, text: 'B', memo: '' },
        ],
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

const mockClipboard = () => {
  const writeText = vi.fn(() => Promise.resolve());
  const readText = vi.fn(() => Promise.resolve('P'));
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { writeText, readText } },
    writable: true,
    configurable: true,
  });
  return { writeText, readText };
};

const renderClip = (overrides: Partial<Parameters<typeof useSheetClipActions>[0]> = {}) => {
  resetStore();
  const closeSearchPanel = vi.fn();
  const onUpdateCell = vi.fn(() => true);
  const isEditing = vi.fn(() => false);
  const isTextTarget = vi.fn(() => true);
  const hook = renderHook(
    (props: Parameters<typeof useSheetClipActions>[0]) => useSheetClipActions(props),
    {
      initialProps: {
        format: 'smi' as const,
        currentRowIndex: 1,
        currentColumn: 'text' as const,
        isEditing,
        isTextTarget,
        inputRef: { current: null },
        onUpdateCell,
        closeSearchPanel,
        ...overrides,
      },
    },
  );
  return { hook, closeSearchPanel, onUpdateCell };
};

describe('useSheetClipActions closeSearchPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  it('clearCell — 비에딧·text 타깃이면 closeSearchPanel 후 셀 비우기', () => {
    const { hook, closeSearchPanel, onUpdateCell } = renderClip();

    act(() => hook.result.current.clearCell());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(onUpdateCell).toHaveBeenCalledWith(1, 'text', '');
  });

  it('clearCell — 에딧 중이면 closeSearchPanel·커밋 미호출', () => {
    const { hook, closeSearchPanel, onUpdateCell } = renderClip({ isEditing: () => true });

    act(() => hook.result.current.clearCell());
    expect(closeSearchPanel).not.toHaveBeenCalled();
    expect(onUpdateCell).not.toHaveBeenCalled();
  });

  it('clipCopy — 게이트 통과 시 closeSearchPanel 후 writeText', () => {
    const { writeText } = mockClipboard();
    const { hook, closeSearchPanel } = renderClip();

    act(() => hook.result.current.clipCopy());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('B');
  });

  it('clipCut — 게이트 통과 시 closeSearchPanel 후 writeText', () => {
    const { writeText } = mockClipboard();
    const { hook, closeSearchPanel } = renderClip();

    act(() => hook.result.current.clipCut());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('B');
  });

  it('clipPaste — 게이트 통과 시 closeSearchPanel 후 readText', () => {
    const { readText } = mockClipboard();
    const { hook, closeSearchPanel } = renderClip();

    act(() => hook.result.current.clipPaste());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(readText).toHaveBeenCalled();
  });

  it('time 열 타깃·다중 선택이면 closeSearchPanel 미호출', () => {
    const { writeText } = mockClipboard();
    const { hook, closeSearchPanel } = renderClip({
      currentColumn: 'starttime',
      isTextTarget: () => false,
    });

    act(() => hook.result.current.clipCopy());
    expect(closeSearchPanel).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('다중 선택 applyTextFormat — multi.<cmd> push shape (backups/currents)', () => {
    useSheetHistoryStore.getState().resetForSheets(1, 0);
    const { hook } = renderClip();
    // renderClip이 store를 리셋하므로 다중 선택은 그 뒤 설정
    useSheetStore.setState((state) => ({
      sheets: [
        {
          ...state.sheets[0],
          multipleActive: true,
          selectedRows: [0, 1],
          multipleStart: 0,
        },
      ],
    }));

    act(() => hook.result.current.applyTextFormat('bold'));

    const stack = useSheetHistoryStore.getState().stacks[0];
    const last = stack.entries[stack.index];
    expect(last?.command).toBe('multi.bold');
    expect(last?.id).toBeNull();
    expect((last?.before as { index: number }[]).map((p) => p.index)).toEqual([0, 1]);
    expect((last?.after as { index: number }[]).map((p) => p.index)).toEqual([0, 1]);
    expect(last?.current).toEqual({ row: 1, col: 1 });
  });
});
