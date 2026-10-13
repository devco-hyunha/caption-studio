import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  SheetCellEditTarget,
  SheetCellEditorMode,
  UseSheetCellFocusResult,
} from '../../../types';
import { useSheetCellEditor } from './use-sheet-cell-editor';

const TEXT_TARGET: SheetCellEditTarget = {
  rowIndex: 1,
  column: 'text',
  left: 0,
  top: 0,
  minWidth: 10,
  minHeight: 10,
  value: 'B',
};

const makeFocus = (target: SheetCellEditTarget | null) => {
  const modeRef = { current: 'focus' as SheetCellEditorMode };
  const targetRef = { current: target };
  const setMode = vi.fn();
  const setTarget = vi.fn((next: SheetCellEditTarget | null) => {
    targetRef.current = next;
  });
  const inputRef = { current: null };
  const wrapRef = { current: null };
  const focusSelectionTarget = vi.fn();
  const resolveMeasuredTarget = vi.fn(() => target);
  const focus: UseSheetCellFocusResult = {
    mode: 'focus',
    target,
    inputRef,
    wrapRef,
    modeRef,
    targetRef,
    rowsRef: { current: [] },
    setMode,
    setTarget,
    findCellElement: vi.fn(),
    resolveEstimatedTarget: vi.fn(),
    resolveMeasuredTarget,
    focusWrapIfNeeded: vi.fn(),
    focusSelectionTarget,
    focusTarget: vi.fn(),
    applyFocus: vi.fn(),
  };
  return { focus, modeRef, targetRef, setTarget };
};

const renderEditor = (
  params: Partial<Parameters<typeof useSheetCellEditor>[0]>,
  target: SheetCellEditTarget | null = TEXT_TARGET,
) => {
  const { focus, modeRef, setTarget } = makeFocus(target);
  const closeSearchPanel = vi.fn();
  const isSearchInputFocused = vi.fn(() => false);
  const onCommitCell = vi.fn(() => true);
  const hook = renderHook(
    (props: Parameters<typeof useSheetCellEditor>[0]) => useSheetCellEditor(props),
    {
      initialProps: {
        format: 'smi' as const,
        focus,
        onCommitCell,
        closeSearchPanel,
        isSearchInputFocused,
        ...params,
      },
    },
  );
  return { hook, modeRef, setTarget, closeSearchPanel, isSearchInputFocused };
};

describe('useSheetCellEditor search gate', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  const dispatchTyping = () =>
    new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', bubbles: true, cancelable: true });

  it('beginEdit — 검색 input 포커스 중이면 에딧 진입 차단 (setTarget·closeSearchPanel 미호출)', () => {
    const { hook, setTarget, closeSearchPanel, isSearchInputFocused } = renderEditor({});
    isSearchInputFocused.mockReturnValue(true);

    act(() => hook.result.current.beginEdit(1, 'text'));
    expect(closeSearchPanel).not.toHaveBeenCalled();
    expect(setTarget).not.toHaveBeenCalled();
  });

  it('beginEdit — 비포커스면 closeSearchPanel 후 에딧 진입', () => {
    const { hook, setTarget, closeSearchPanel, isSearchInputFocused } = renderEditor({});
    isSearchInputFocused.mockReturnValue(false);

    act(() => hook.result.current.beginEdit(1, 'text'));
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenCalledWith(TEXT_TARGET);
  });

  it('beginEditFromTyping — 검색 input 포커스 중이면 typing 에딧 미진입 (mode edit 안됨)', () => {
    const { hook, modeRef, isSearchInputFocused } = renderEditor({});
    isSearchInputFocused.mockReturnValue(true);

    act(() => hook.result.current.beginEditFromTyping(dispatchTyping()));
    expect(modeRef.current).not.toBe('edit');
  });

  it('beginEditFromTyping — 비포커스면 typing 에딧 진입 (mode edit)', () => {
    const { hook, modeRef, isSearchInputFocused } = renderEditor({});
    isSearchInputFocused.mockReturnValue(false);

    act(() => hook.result.current.beginEditFromTyping(dispatchTyping()));
    expect(modeRef.current).toBe('edit');
  });
});
