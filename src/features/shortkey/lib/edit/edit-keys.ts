import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS, SHORTKEY_PLACEHOLDERS } from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/** F2 편집 진입 · Esc 취소(다중 선택은 토글 off) · Enter 줄바꿈/진입 */
const registerSheetEditKeys = (shortcuts: ShortcutsApi, getActions: () => SheetShortkeyActions) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(
      SHORTKEY_IDS.SHEET_EDIT_ON,
      (event) => {
        const actions = getActions();
        if (actions.isMultiple()) return;
        if (actions.isEditing() || !actions.isTextTarget()) return;
        event.preventDefault();
        actions.beginEdit();
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.SHEET_EDIT_ON },
    ),
    defineSheetKey(
      SHORTKEY_IDS.SHEET_EDIT_OFF,
      (event) => {
        const actions = getActions();
        // Esc 우선순위: 검색 패널 → 다중 선택 → 에딧 (작업 1: 검색 닫기까지)
        if (actions.isSearchPanelOpen()) {
          event.preventDefault();
          actions.closeSearchPanel();
          return;
        }
        if (actions.isMultiple()) {
          event.preventDefault();
          actions.toggleMultiple();
          return;
        }
        if (!actions.isEditing()) return;
        event.preventDefault();
        event.stopPropagation();
        actions.cancelEdit();
      },
      { placeholder: SHORTKEY_PLACEHOLDERS.SHEET_EDIT_OFF },
    ),
    defineSheetKey(SHORTKEY_IDS.SHEET_EDIT_ENTER, (event) => {
      const actions = getActions();
      if (actions.isEditing()) {
        event.preventDefault();
        event.stopPropagation();
        actions.insertEditorLineBreak();
        return;
      }
      if (actions.isMultiple()) return;
      if (!actions.isTextTarget()) return;
      event.preventDefault();
      event.stopPropagation();
      actions.beginEdit();
    }),
  ]);
};

export { registerSheetEditKeys };
