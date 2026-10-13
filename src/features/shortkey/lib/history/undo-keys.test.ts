import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetUndoKeys } from './undo-keys';

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
  isTextTarget: () => false,
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
  isTimeTarget: () => false,
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
  toggleSearch: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  ...overrides,
});

const dispatch = (init: KeyboardEventInit & { code: string }) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  document.dispatchEvent(event);
  return event;
};

const runUndo = (
  actions: SheetShortkeyActions,
  run: (shortcuts: ReturnType<typeof createShortcuts>) => void,
) => {
  const shortcuts = createShortcuts();
  registerSheetUndoKeys(shortcuts, () => actions);
  shortcuts.start();
  run(shortcuts);
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetUndoKeys', () => {
  it('Ctrl+Z는 undo 호출 + preventDefault', () => {
    const undo = vi.fn();
    const actions = baseActions({ undo });

    runUndo(actions, () => {
      const event = dispatch({ code: 'KeyZ', key: 'z', ctrlKey: true });
      expect(undo).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('Ctrl+Y는 redo 호출 + preventDefault', () => {
    const redo = vi.fn();
    const actions = baseActions({ redo });

    runUndo(actions, () => {
      const event = dispatch({ code: 'KeyY', key: 'y', ctrlKey: true });
      expect(redo).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('Ctrl+Shift+Z는 redo 호출 (M3 병행 등록)', () => {
    const redo = vi.fn();
    const actions = baseActions({ redo });

    runUndo(actions, () => {
      const event = dispatch({ code: 'KeyZ', key: 'z', ctrlKey: true, shiftKey: true });
      expect(redo).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('에딧 중에는 undo·redo 미호출 + preventDefault 하지 않는다 (H1 — 네이티브 undo 양보)', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    const actions = baseActions({ undo, redo, isEditing: () => true });

    runUndo(actions, () => {
      const undoEvent = dispatch({ code: 'KeyZ', key: 'z', ctrlKey: true });
      const redoEvent = dispatch({ code: 'KeyY', key: 'y', ctrlKey: true });
      expect(undo).not.toHaveBeenCalled();
      expect(redo).not.toHaveBeenCalled();
      // 가드 통과 전 preventDefault 금지 → contenteditable 네이티브 undo가 살아 있어야
      expect(undoEvent.defaultPrevented).toBe(false);
      expect(redoEvent.defaultPrevented).toBe(false);
    });
  });

  it('Ctrl 없이 Z/Y는 무반응', () => {
    const undo = vi.fn();
    const redo = vi.fn();
    const actions = baseActions({ undo, redo });

    runUndo(actions, () => {
      dispatch({ code: 'KeyZ', key: 'z' });
      dispatch({ code: 'KeyY', key: 'y' });
      expect(undo).not.toHaveBeenCalled();
      expect(redo).not.toHaveBeenCalled();
    });
  });
});
