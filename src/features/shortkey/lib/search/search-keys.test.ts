import { describe, expect, it, vi } from 'vitest';
import { createShortcuts } from '@/shared/lib/shortcuts';
import type { SheetShortkeyActions } from '../../types';
import { bindPrintableEditCallback } from '../edit/printable-edit';
import { registerSheetSearchKeys } from './search-keys';

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

// printable-edit + search-keys를 함께 등록 — Slash 키의 실제 발화 순서 검증
const runSearchKeys = (
  actions: SheetShortkeyActions,
  run: (shortcuts: ReturnType<typeof createShortcuts>) => void,
) => {
  const shortcuts = createShortcuts();
  registerSheetSearchKeys(shortcuts, () => actions);
  bindPrintableEditCallback(shortcuts, () => actions);
  shortcuts.start();
  run(shortcuts);
  shortcuts.stop();
  shortcuts.removeAll();
};

describe('registerSheetSearchKeys + printable-edit (Slash)', () => {
  it('비에딧 text 셀에서 `/` 단독 — printable 에딧 오픈, focusSearch 미호출', () => {
    const focusSearch = vi.fn();
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ focusSearch, beginEditFromTyping, isEditing: () => false });

    runSearchKeys(actions, () => {
      dispatch({ code: 'Slash', key: '/' });
      expect(beginEditFromTyping).toHaveBeenCalledTimes(1);
      expect(focusSearch).not.toHaveBeenCalled();
    });
  });

  it('`Ctrl+/` — focusSearch 호출, beginEditFromTyping 미호출 (ctrlKey라 printable 미발화)', () => {
    const focusSearch = vi.fn();
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ focusSearch, beginEditFromTyping, isEditing: () => false });

    runSearchKeys(actions, () => {
      const event = dispatch({ code: 'Slash', key: '/', ctrlKey: true });
      expect(focusSearch).toHaveBeenCalledTimes(1);
      expect(beginEditFromTyping).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('에딧 중 `Ctrl+/` — focusSearch 미호출 (검색창 동작 차단)', () => {
    const focusSearch = vi.fn();
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ focusSearch, beginEditFromTyping, isEditing: () => true });

    runSearchKeys(actions, () => {
      dispatch({ code: 'Slash', key: '/', ctrlKey: true });
      expect(focusSearch).not.toHaveBeenCalled();
      expect(beginEditFromTyping).not.toHaveBeenCalled();
    });
  });

  it('Space는 선택 토글 선점 — printable-edit 미발화 (regression)', () => {
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ beginEditFromTyping, isEditing: () => false });

    runSearchKeys(actions, () => {
      dispatch({ code: 'Space', key: ' ' });
      expect(beginEditFromTyping).not.toHaveBeenCalled();
    });
  });

  it('일반 printable(KeyA)는 타입 투 리플레이스 유지', () => {
    const beginEditFromTyping = vi.fn();
    const focusSearch = vi.fn();
    const actions = baseActions({ beginEditFromTyping, focusSearch, isEditing: () => false });

    runSearchKeys(actions, () => {
      dispatch({ code: 'KeyA', key: 'a' });
      expect(beginEditFromTyping).toHaveBeenCalledTimes(1);
      expect(focusSearch).not.toHaveBeenCalled();
    });
  });
});
