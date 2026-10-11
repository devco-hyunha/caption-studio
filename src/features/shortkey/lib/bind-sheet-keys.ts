import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../types';
import { registerSheetClipKeys } from './sheet/clip-keys';
import { registerSheetEditKeys } from './sheet/edit-keys';
import { registerSheetMoveKeys } from './sheet/move-keys';
import { registerSheetMutateKeys } from './sheet/mutate-keys';
import { registerSheetSelectionKeys } from './sheet/selection-keys';

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
};

export { registerSheetNavigationKeys };
