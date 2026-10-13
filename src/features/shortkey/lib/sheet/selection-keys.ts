import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS } from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/** Space — 다중 선택 중 현재 행 토글. 에딧 중에는 문자 입력에 양보 */
const registerSheetSelectionKeys = (
  shortcuts: ShortcutsApi,
  getActions: () => SheetShortkeyActions,
) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(SHORTKEY_IDS.ROW_SELECT_TOGGLE, (event) => {
      const actions = getActions();
      if (actions.isEditing()) return;
      if (!actions.hasFocus()) return;
      // 포커스 중 Space는 기본 동작 차단 (multiple 밖에서도 삼킴 — `/` parity)
      event.preventDefault();
      if (!actions.isMultiple()) return;
      actions.toggleRowSelect();
    }),
  ]);
};

export { registerSheetSelectionKeys };
