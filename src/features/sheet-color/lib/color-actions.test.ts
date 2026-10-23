import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useColorStore } from '../model/use-color-store';
import { useSheetColorActions } from './color-actions';

const renderColor = (overrides: Partial<Parameters<typeof useSheetColorActions>[0]> = {}) => {
  const execCommand = vi.fn(() => true);
  // jsdom은 document.execCommand 미정의 — 대입으로 목 잡음 (spyOn 불가)
  document.execCommand = execCommand;

  const isEditing = vi.fn(() => true);
  const isMultiple = vi.fn(() => false);
  const isTextTarget = vi.fn(() => true);
  const closeSearchPanel = vi.fn();
  const execToSelected = vi.fn();
  const execToCurrent = vi.fn();

  const hook = renderHook(
    (props: Parameters<typeof useSheetColorActions>[0]) => useSheetColorActions(props),
    {
      initialProps: {
        isEditing,
        isMultiple,
        isTextTarget,
        inputRef: { current: null },
        closeSearchPanel,
        execToSelected,
        execToCurrent,
        ...overrides,
      },
    },
  );
  return { hook, execCommand, closeSearchPanel, execToSelected, execToCurrent };
};

describe('useSheetColorActions — 3분기 dispatch', () => {
  beforeEach(() => {
    useColorStore.setState({
      colors: [
        '#ff0000',
        '#ff00ff',
        '#aa00ff',
        '#0000ff',
        '#00ffff',
        '#00ff00',
        '#ffff00',
        '#ffaa00',
      ],
    });
    vi.restoreAllMocks();
  });

  it('에딧 중 — closeSearchPanel 후 surface execCommand(foreColor, hex)', () => {
    const { hook, execCommand, closeSearchPanel, execToSelected, execToCurrent } = renderColor();

    act(() => hook.result.current.applyColorCommand('color0'));

    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    expect(execToSelected).not.toHaveBeenCalled();
    expect(execToCurrent).not.toHaveBeenCalled();
  });

  it('에딧 중 colorClear — execCommand(removeFormat, foreColor)', () => {
    const { hook, execCommand } = renderColor();

    act(() => hook.result.current.applyColorCommand('color_clear'));

    expect(execCommand).toHaveBeenCalledWith('removeFormat', false, 'foreColor');
  });

  it('비에딧 다중 선택 — execToSelected(transform, command)', () => {
    const { hook, execCommand, execToSelected, execToCurrent } = renderColor({
      isEditing: () => false,
      isMultiple: () => true,
    });

    act(() => hook.result.current.applyColorCommand('color3'));

    expect(execCommand).not.toHaveBeenCalled();
    expect(execToSelected).toHaveBeenCalledTimes(1);
    expect(execToSelected).toHaveBeenCalledWith(expect.any(Function), 'color3');
    expect(execToCurrent).not.toHaveBeenCalled();
  });

  it('비에딧 단건 text 타깃 — execToCurrent(transform), 다중·exec 미호출', () => {
    const { hook, execCommand, execToSelected, execToCurrent } = renderColor({
      isEditing: () => false,
      isMultiple: () => false,
      isTextTarget: () => true,
    });

    act(() => hook.result.current.applyColorCommand('color1'));

    expect(execCommand).not.toHaveBeenCalled();
    expect(execToSelected).not.toHaveBeenCalled();
    expect(execToCurrent).toHaveBeenCalledTimes(1);
    expect(execToCurrent).toHaveBeenCalledWith(expect.any(Function));
  });

  it('비에딧·단건·non-text 타깃 — 어떤 exec·execTo*도 미호출 (closeSearchPanel만)', () => {
    const { hook, execCommand, execToSelected, execToCurrent, closeSearchPanel } = renderColor({
      isEditing: () => false,
      isMultiple: () => false,
      isTextTarget: () => false,
    });

    act(() => hook.result.current.applyColorCommand('color1'));

    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(execCommand).not.toHaveBeenCalled();
    expect(execToSelected).not.toHaveBeenCalled();
    expect(execToCurrent).not.toHaveBeenCalled();
  });
});
