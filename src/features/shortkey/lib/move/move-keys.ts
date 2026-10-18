import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS } from '../../model/keys/ids';
import { SHORTKEY_PLACEHOLDERS } from '../../model/keys/labels';
import { defineSheetKey, registerSheetKeys } from '../engine/shortkey-keys';

/** Tab / Shift+Tab / Page / Arrow 이동 — Shift 여부는 move 핸들러가 event.shiftKey로 판단 */
const registerSheetMoveKeys = (shortcuts: ShortcutsApi, getActions: () => SheetShortkeyActions) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(
      SHORTKEY_IDS.NEXT_ROW_MOVE,
      (event) => {
        const actions = getActions();
        if (!actions.hasFocus()) return;
        event.preventDefault();
        actions.moveTabNext(event);
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.NEXT_ROW_MOVE },
    ),
    defineSheetKey(
      SHORTKEY_IDS.PREV_ROW_MOVE,
      (event) => {
        const actions = getActions();
        if (!actions.hasFocus()) return;
        event.preventDefault();
        actions.moveTabPrev(event);
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.PREV_ROW_MOVE },
    ),
    defineSheetKey(SHORTKEY_IDS.PAGE_UP, (event) => {
      const actions = getActions();
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.movePagePrev(event);
    }),
    defineSheetKey(SHORTKEY_IDS.PAGE_DOWN, (event) => {
      const actions = getActions();
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.movePageNext(event);
    }),
    defineSheetKey(SHORTKEY_IDS.ROW_UP, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveRowPrev(event);
    }),
    defineSheetKey(SHORTKEY_IDS.ROW_DOWN, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveRowNext(event);
    }),
    defineSheetKey(SHORTKEY_IDS.ROW_UP_SELECT, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveRowPrev(event);
    }),
    defineSheetKey(SHORTKEY_IDS.ROW_DOWN_SELECT, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveRowNext(event);
    }),
    defineSheetKey(SHORTKEY_IDS.COL_LEFT, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveColPrev(event);
    }),
    defineSheetKey(SHORTKEY_IDS.COL_RIGHT, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      event.preventDefault();
      actions.moveColNext(event);
    }),
  ]);
};

export { registerSheetMoveKeys };
