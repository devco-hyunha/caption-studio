import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { registerSheetClipKeys } from '../clip/clip-keys';
import { registerSheetColorKeys } from '../color/color-keys';
import { registerSheetEditKeys } from '../edit/edit-keys';
import { registerSheetMoveKeys } from '../move/move-keys';
import { registerSheetMutateKeys } from '../mutate/mutate-keys';
import { registerSheetSelectionKeys } from '../selection/selection-keys';
import { registerSheetSearchKeys } from '../search/search-keys';
import { registerSheetTimeKeys } from '../time/time-keys';
import { registerSheetVideoKeys } from '../video/video-keys';
import { registerSheetUndoKeys } from '../history/undo-keys';

/**
 * 시트 네비게이션 키 일괄 등록 — 기능별 registrar의 조합.
 * mask는 shortkey store에서 조회한다.
 */
const registerSheetNavigationKeys = (
  shortcuts: ShortcutsApi,
  getActions: () => SheetShortkeyActions,
) => {
  registerSheetMoveKeys(shortcuts, getActions);
  registerSheetEditKeys(shortcuts, getActions);
  registerSheetSelectionKeys(shortcuts, getActions);
  registerSheetMutateKeys(shortcuts, getActions);
  registerSheetClipKeys(shortcuts, getActions);
  registerSheetColorKeys(shortcuts, getActions);
  registerSheetTimeKeys(shortcuts, getActions);
  registerSheetVideoKeys(shortcuts, getActions);
  registerSheetSearchKeys(shortcuts, getActions);
  registerSheetUndoKeys(shortcuts, getActions);
};

export { registerSheetNavigationKeys };
