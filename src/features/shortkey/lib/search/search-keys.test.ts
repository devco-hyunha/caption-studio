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
  clearCell: vi.fn(),
  clipCut: vi.fn(),
  clipCopy: vi.fn(),
  clipPaste: vi.fn(),
  isTimeTarget: () => false,
  timePlus: vi.fn(),
  timeMinus: vi.fn(),
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
  it('비에딧 text 셀에서 `/` — toggleSearch 호출, beginEditFromTyping 미호출 (에딧 창 안 열림)', () => {
    const toggleSearch = vi.fn();
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ toggleSearch, beginEditFromTyping, isEditing: () => false });

    runSearchKeys(actions, () => {
      const event = dispatch({ code: 'Slash', key: '/' });
      expect(toggleSearch).toHaveBeenCalledTimes(1);
      expect(beginEditFromTyping).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it('에딧 중 `/` — toggleSearch 미호출 (검색창 동작 차단), beginEditFromTyping 미호출', () => {
    const toggleSearch = vi.fn();
    const beginEditFromTyping = vi.fn();
    const actions = baseActions({ toggleSearch, beginEditFromTyping, isEditing: () => true });

    runSearchKeys(actions, () => {
      dispatch({ code: 'Slash', key: '/' });
      expect(toggleSearch).not.toHaveBeenCalled();
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
    const toggleSearch = vi.fn();
    const actions = baseActions({ beginEditFromTyping, toggleSearch, isEditing: () => false });

    runSearchKeys(actions, () => {
      dispatch({ code: 'KeyA', key: 'a' });
      expect(beginEditFromTyping).toHaveBeenCalledTimes(1);
      expect(toggleSearch).not.toHaveBeenCalled();
    });
  });
});
