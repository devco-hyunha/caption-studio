import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetEditKeys } from './edit-keys';

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
  applyColor: vi.fn(),
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

// 포커스된 요소에서 keydown 발생 → document로 버블링 (event.target = 요소)
const dispatchOn = (target: HTMLElement, init: KeyboardEventInit & { code: string }) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

const runEditKeys = (actions: SheetShortkeyActions, run: () => void) => {
  const shortcuts = createShortcuts();
  registerSheetEditKeys(shortcuts, () => actions);
  shortcuts.start();
  run();
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetEditKeys — Esc 우선순위 (search → multiple → edit)', () => {
  it('Esc — 검색 패널 열림 시 closeSearchPanel, toggleMultiple·cancelEdit 미호출', () => {
    const closeSearchPanel = vi.fn();
    const toggleMultiple = vi.fn();
    const cancelEdit = vi.fn();
    const actions = baseActions({
      closeSearchPanel,
      toggleMultiple,
      cancelEdit,
      isSearchPanelOpen: () => true,
      isMultiple: () => true,
      isEditing: () => true,
    });

    runEditKeys(actions, () => {
      const event = dispatch({ code: 'Escape', key: 'Escape' });
      expect(closeSearchPanel).toHaveBeenCalledTimes(1);
      expect(toggleMultiple).not.toHaveBeenCalled();
      expect(cancelEdit).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('Esc — 검색 닫힘·다중 선택 시 toggleMultiple, cancelEdit 미호출', () => {
    const closeSearchPanel = vi.fn();
    const toggleMultiple = vi.fn();
    const cancelEdit = vi.fn();
    const actions = baseActions({
      closeSearchPanel,
      toggleMultiple,
      cancelEdit,
      isSearchPanelOpen: () => false,
      isMultiple: () => true,
    });

    runEditKeys(actions, () => {
      dispatch({ code: 'Escape', key: 'Escape' });
      expect(closeSearchPanel).not.toHaveBeenCalled();
      expect(toggleMultiple).toHaveBeenCalledTimes(1);
      expect(cancelEdit).not.toHaveBeenCalled();
    });
  });

  it('Esc — 검색 닫힘·비다중·에딧 중이면 cancelEdit', () => {
    const closeSearchPanel = vi.fn();
    const toggleMultiple = vi.fn();
    const cancelEdit = vi.fn();
    const actions = baseActions({
      closeSearchPanel,
      toggleMultiple,
      cancelEdit,
      isSearchPanelOpen: () => false,
      isMultiple: () => false,
      isEditing: () => true,
    });

    runEditKeys(actions, () => {
      dispatch({ code: 'Escape', key: 'Escape' });
      expect(closeSearchPanel).not.toHaveBeenCalled();
      expect(toggleMultiple).not.toHaveBeenCalled();
      expect(cancelEdit).toHaveBeenCalledTimes(1);
    });
  });

  it('Esc — input 포커스 중 전역 Esc 미발화 (checkIsInput 게이트, enableInInput 없음)', () => {
    const closeSearchPanel = vi.fn();
    const cancelEdit = vi.fn();
    const actions = baseActions({
      closeSearchPanel,
      cancelEdit,
      isSearchPanelOpen: () => true,
      isMultiple: () => false,
      isEditing: () => false,
    });

    runEditKeys(actions, () => {
      const input = document.createElement('input');
      input.type = 'search';
      document.body.appendChild(input);
      input.focus();

      dispatchOn(input, { code: 'Escape', key: 'Escape' });
      // input 포커스 중 전역 핸들러는 발화하지 않는다 — 검색 input 자체 onKeyDown가 닫기
      expect(closeSearchPanel).not.toHaveBeenCalled();

      input.remove();
    });
  });

  it('Esc — 검색 닫힘·비다중·비에딧이면 아무 동작도 미호출', () => {
    const closeSearchPanel = vi.fn();
    const toggleMultiple = vi.fn();
    const cancelEdit = vi.fn();
    const actions = baseActions({
      closeSearchPanel,
      toggleMultiple,
      cancelEdit,
      isSearchPanelOpen: () => false,
      isMultiple: () => false,
      isEditing: () => false,
    });

    runEditKeys(actions, () => {
      dispatch({ code: 'Escape', key: 'Escape' });
      expect(closeSearchPanel).not.toHaveBeenCalled();
      expect(toggleMultiple).not.toHaveBeenCalled();
      expect(cancelEdit).not.toHaveBeenCalled();
    });
  });
});
