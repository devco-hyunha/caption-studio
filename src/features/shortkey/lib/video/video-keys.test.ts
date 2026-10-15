import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetVideoKeys } from './video-keys';

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

const runVideo = (
  actions: SheetShortkeyActions,
  run: (shortcuts: ReturnType<typeof createShortcuts>) => void,
) => {
  const shortcuts = createShortcuts();
  registerSheetVideoKeys(shortcuts, () => actions);
  shortcuts.start();
  run(shortcuts);
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetVideoKeys', () => {
  it('Ctrl+Q는 videoJump · 다중 선택은 양보', () => {
    const videoJump = vi.fn();

    runVideo(baseActions({ videoJump }), () => {
      const event = dispatch({ code: 'KeyQ', key: 'q', ctrlKey: true });
      expect(videoJump).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    const multipleJump = vi.fn();
    runVideo(baseActions({ videoJump: multipleJump, isMultiple: () => true }), () => {
      dispatch({ code: 'KeyQ', key: 'q', ctrlKey: true });
      expect(multipleJump).not.toHaveBeenCalled();
    });
  });

  it('Alt+Q는 sheetJump', () => {
    const sheetJump = vi.fn();

    runVideo(baseActions({ sheetJump }), () => {
      dispatch({ code: 'KeyQ', key: 'q', altKey: true });
      expect(sheetJump).toHaveBeenCalledTimes(1);
    });
  });

  it('Ctrl+Space는 videoPlayToggle', () => {
    const videoPlayToggle = vi.fn();

    runVideo(baseActions({ videoPlayToggle }), () => {
      dispatch({ code: 'Space', key: ' ', ctrlKey: true });
      expect(videoPlayToggle).toHaveBeenCalledTimes(1);
    });
  });

  it('Ctrl+←/→는 videoSeekPrev/Next · Ctrl+↑/↓는 volumeUp/Down', () => {
    const videoSeekPrev = vi.fn();
    const videoSeekNext = vi.fn();
    const volumeUp = vi.fn();
    const volumeDown = vi.fn();

    runVideo(baseActions({ videoSeekPrev, videoSeekNext, volumeUp, volumeDown }), () => {
      dispatch({ code: 'ArrowLeft', key: 'ArrowLeft', ctrlKey: true });
      expect(videoSeekPrev).toHaveBeenCalledTimes(1);

      dispatch({ code: 'ArrowRight', key: 'ArrowRight', ctrlKey: true });
      expect(videoSeekNext).toHaveBeenCalledTimes(1);

      dispatch({ code: 'ArrowUp', key: 'ArrowUp', ctrlKey: true });
      expect(volumeUp).toHaveBeenCalledTimes(1);

      dispatch({ code: 'ArrowDown', key: 'ArrowDown', ctrlKey: true });
      expect(volumeDown).toHaveBeenCalledTimes(1);
    });
  });

  it('Ctrl+Alt+←/→는 cuePrev/cueNext', () => {
    const cuePrev = vi.fn();
    const cueNext = vi.fn();

    runVideo(baseActions({ cuePrev, cueNext }), () => {
      dispatch({ code: 'ArrowLeft', key: 'ArrowLeft', ctrlKey: true, altKey: true });
      expect(cuePrev).toHaveBeenCalledTimes(1);

      dispatch({ code: 'ArrowRight', key: 'ArrowRight', ctrlKey: true, altKey: true });
      expect(cueNext).toHaveBeenCalledTimes(1);
    });
  });

  it('수식 없는 Q·Space·화살표는 무반응', () => {
    const videoJump = vi.fn();
    const videoPlayToggle = vi.fn();
    const cuePrev = vi.fn();

    runVideo(baseActions({ videoJump, videoPlayToggle, cuePrev }), () => {
      dispatch({ code: 'KeyQ', key: 'q' });
      dispatch({ code: 'Space', key: ' ' });
      dispatch({ code: 'ArrowLeft', key: 'ArrowLeft' });
      expect(videoJump).not.toHaveBeenCalled();
      expect(videoPlayToggle).not.toHaveBeenCalled();
      expect(cuePrev).not.toHaveBeenCalled();
    });
  });
});
