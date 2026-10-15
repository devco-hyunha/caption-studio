import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetClipKeys } from './clip-keys';

const baseActions = (overrides: Partial<SheetShortkeyActions> = {}): SheetShortkeyActions => ({
  moveTabNext: vi.fn(),
  moveTabPrev: vi.fn(),
  moveRowPrev: vi.fn(),
  moveRowNext: vi.fn(),
  moveColPrev: vi.fn(),
  moveColNext: vi.fn(),
  movePagePrev: vi.fn(),
  movePageNext: vi.fn(),
  isEditing: () => false,
  isTextTarget: () => true,
  hasFocus: () => true,
  isMultiple: () => false,
  beginEdit: vi.fn(),
  cancelEdit: vi.fn(),
  beginEditFromTyping: vi.fn(),
  insertEditorLineBreak: vi.fn(),
  toggleMultiple: vi.fn(),
  toggleRowSelect: vi.fn(),
  insertRow: vi.fn(),
  removeRow: vi.fn(),
  applyTextFormat: vi.fn(),
  clearCell: vi.fn(),
  clipCut: vi.fn(),
  clipCopy: vi.fn(),
  clipPaste: vi.fn(),
  isTimeTarget: () => true,
  timePlus: vi.fn(),
  timeMinus: vi.fn(),
  timeCarve: vi.fn(),
  videoJump: vi.fn(),
  sheetJump: vi.fn(),
  videoPlayToggle: vi.fn(),
  videoSeekPrev: vi.fn(),
  videoSeekNext: vi.fn(),
  volumeUp: vi.fn(),
  volumeDown: vi.fn(),
  cuePrev: vi.fn(),
  cueNext: vi.fn(),
  focusSearch: vi.fn(),
  closeSearchPanel: vi.fn(),
  isSearchPanelOpen: () => false,
  undo: vi.fn(),
  redo: vi.fn(),
  ...overrides,
});

const dispatch = (init: KeyboardEventInit & { code: string }) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  document.dispatchEvent(event);
  return event;
};

const runClip = (
  actions: SheetShortkeyActions,
  run: (shortcuts: ReturnType<typeof createShortcuts>) => void,
) => {
  const shortcuts = createShortcuts();
  registerSheetClipKeys(shortcuts, () => actions);
  shortcuts.start();
  run(shortcuts);
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetClipKeys', () => {
  it('Ctrl+B/I/U는 down 한 번 — applyTextFormat에 명령을 전달한다', () => {
    const applyTextFormat = vi.fn();
    const actions = baseActions({ applyTextFormat });

    runClip(actions, () => {
      dispatch({ code: 'KeyB', key: 'b', ctrlKey: true });
      expect(applyTextFormat).toHaveBeenLastCalledWith('bold');

      dispatch({ code: 'KeyI', key: 'i', ctrlKey: true });
      expect(applyTextFormat).toHaveBeenLastCalledWith('italic');

      dispatch({ code: 'KeyU', key: 'u', ctrlKey: true });
      expect(applyTextFormat).toHaveBeenLastCalledWith('underline');
    });
  });

  it('Backspace/Delete는 비에딧에서만 clearCell, preventDefault', () => {
    const clearCell = vi.fn();
    const actions = baseActions({ clearCell });

    runClip(actions, () => {
      const backspace = dispatch({ code: 'Backspace', key: 'Backspace' });
      expect(clearCell).toHaveBeenCalledTimes(1);
      expect(backspace.defaultPrevented).toBe(true);

      dispatch({ code: 'Delete', key: 'Delete' });
      expect(clearCell).toHaveBeenCalledTimes(2);
    });
  });

  it('에딧 중 Backspace는 네이티브에 양보 — clearCell 미호출', () => {
    const clearCell = vi.fn();
    const actions = baseActions({ clearCell, isEditing: () => true });

    runClip(actions, () => {
      const event = dispatch({ code: 'Backspace', key: 'Backspace' });
      expect(clearCell).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  it('Ctrl+X/C/V는 비에딧에서만 clip actions, 에딧 중 양보', () => {
    const clipCopy = vi.fn();
    const clipPaste = vi.fn();

    runClip(baseActions({ clipCopy }), () => {
      dispatch({ code: 'KeyC', key: 'c', ctrlKey: true });
      expect(clipCopy).toHaveBeenCalledTimes(1);
    });

    runClip(baseActions({ clipPaste, isEditing: () => true }), () => {
      dispatch({ code: 'KeyV', key: 'v', ctrlKey: true });
      expect(clipPaste).not.toHaveBeenCalled();
    });
  });

  it('다중 선택·text 타깃 여부는 actions가 판별 (registrar는 분기하지 않음)', () => {
    const applyTextFormat = vi.fn();
    const actions = baseActions({ applyTextFormat, isMultiple: () => true });

    runClip(actions, () => {
      dispatch({ code: 'KeyB', key: 'b', ctrlKey: true });
      // 다중 선택이어도 applyTextFormat은 호출 — 훅에서 일괄 분기
      expect(applyTextFormat).toHaveBeenCalledWith('bold');
    });
  });
});
