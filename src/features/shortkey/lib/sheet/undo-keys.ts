import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import {
  SHORTKEY_IDS,
  SHORTKEY_PLACEHOLDERS,
  SHORTKEY_TYPES,
} from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/**
 * undo/redo (Ctrl+Z/Y, Ctrl+Shift+Z).
 * 에딧 중에는 no-op (`/` `!edit.state` parity). layer는 설정 input 등 checkIsInput으로 차단.
 * `preventDefault`는 옵션에 두지 않는다 — 엔진이 핸들러 전에 막으면 contenteditable 네이티브
 * undo까지 죽는다(H1). 가드 통과 후 핸들러 안에서 `event.preventDefault()`한다.
 */
const registerSheetUndoKeys = (shortcuts: ShortcutsApi, getActions: () => SheetShortkeyActions) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(
      SHORTKEY_IDS.UNDO,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.undo();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.UNDO,
        type: SHORTKEY_TYPES.HOLD,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.REDO,
      (event) => {
        const actions = getActions();
        if (actions.isEditing()) return;
        event.preventDefault();
        actions.redo();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.REDO,
        type: SHORTKEY_TYPES.HOLD,
      },
    ),
  ]);
};

export { registerSheetUndoKeys };
