import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import {
  SHORTKEY_IDS,
  SHORTKEY_PLACEHOLDERS,
  SHORTKEY_TYPES,
} from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/**
 * BIU(Ctrl+B/I/U)·clear(Backspace/Delete)·클립(Ctrl+X/C/V).
 * 에딧 중에는 서식만 에디터에 양보하지 않고 execCommand(훅 내 분기), clear/클립은 네이티브에 양보.
 * 다중 선택·text 타깃 분기는 actions 훅에서 처리.
 */
const registerSheetClipKeys = (shortcuts: ShortcutsApi, getActions: () => SheetShortkeyActions) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(
      SHORTKEY_IDS.FONT_BOLD,
      () => {
        getActions().applyTextFormat('bold');
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.FONT_BOLD, type: SHORTKEY_TYPES.DOWN },
    ),
    defineSheetKey(
      SHORTKEY_IDS.FONT_ITALIC,
      () => {
        getActions().applyTextFormat('italic');
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.FONT_ITALIC, type: SHORTKEY_TYPES.DOWN },
    ),
    defineSheetKey(
      SHORTKEY_IDS.FONT_UNDERLINE,
      () => {
        getActions().applyTextFormat('underline');
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.FONT_UNDERLINE, type: SHORTKEY_TYPES.DOWN },
    ),
    defineSheetKey(
      SHORTKEY_IDS.CELL_CLEAR_BACKSPACE,
      (event) => {
        const actions = getActions();
        // 에딧 중 Backspace는 contenteditable 네이티브 삭제에 양보
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.clearCell();
      },
      { type: SHORTKEY_TYPES.HOLD },
    ),
    defineSheetKey(
      SHORTKEY_IDS.CELL_CLEAR_DELETE,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.clearCell();
      },
      { type: SHORTKEY_TYPES.HOLD },
    ),
    defineSheetKey(
      SHORTKEY_IDS.CUT,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.clipCut();
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.CUT, type: SHORTKEY_TYPES.DOWN },
    ),
    defineSheetKey(
      SHORTKEY_IDS.COPY,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.clipCopy();
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.COPY, type: SHORTKEY_TYPES.DOWN },
    ),
    defineSheetKey(
      SHORTKEY_IDS.PASTE,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.clipPaste();
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.PASTE, type: SHORTKEY_TYPES.DOWN },
    ),
  ]);
};

export { registerSheetClipKeys };
