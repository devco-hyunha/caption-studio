import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS } from '../../model/keys/ids';
import { useShortkeyStore } from '../../model/store/use-shortkey-store';
import { registerSheetColorKeys } from './color-keys';

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
  applyColor: vi.fn(),
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

const runColor = (actions: SheetShortkeyActions, run: () => void) => {
  const shortcuts = createShortcuts();
  registerSheetColorKeys(shortcuts, () => actions);
  shortcuts.start();
  run();
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetColorKeys', () => {
  beforeEach(() => {
    useShortkeyStore.getState().resetMasks();
  });

  it('Ctrl+1..8는 color0..7, preventDefault', () => {
    const applyColor = vi.fn();
    const actions = baseActions({ applyColor });

    runColor(actions, () => {
      const first = dispatch({ code: 'Digit1', key: '1', ctrlKey: true });
      expect(applyColor).toHaveBeenLastCalledWith('color0');
      expect(first.defaultPrevented).toBe(true);

      dispatch({ code: 'Digit8', key: '8', ctrlKey: true });
      expect(applyColor).toHaveBeenLastCalledWith('color7');
      expect(applyColor).toHaveBeenCalledTimes(2);
    });
  });

  it('Ctrl+9는 color_clear', () => {
    const applyColor = vi.fn();
    const actions = baseActions({ applyColor });

    runColor(actions, () => {
      dispatch({ code: 'Digit9', key: '9', ctrlKey: true });
      expect(applyColor).toHaveBeenCalledWith('color_clear');
    });
  });

  it('Ctrl 없는 Digit는 무반응', () => {
    const applyColor = vi.fn();
    const actions = baseActions({ applyColor });

    runColor(actions, () => {
      dispatch({ code: 'Digit1', key: '1' });
      dispatch({ code: 'Digit9', key: '9' });
      expect(applyColor).not.toHaveBeenCalled();
    });
  });

  it('custom key mask 변경(store) 반영 — 변경된 mask로 발화', () => {
    const applyColor = vi.fn();
    const actions = baseActions({ applyColor });
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.COLOR_0, 'ctrl+shift+q');

    runColor(actions, () => {
      dispatch({ code: 'KeyQ', key: 'q', ctrlKey: true, shiftKey: true });
      expect(applyColor).toHaveBeenCalledWith('color0');
    });
    useShortkeyStore.getState().resetMasks();
  });
});
