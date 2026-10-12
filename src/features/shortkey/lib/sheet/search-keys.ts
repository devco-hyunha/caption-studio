import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import {
	SHORTKEY_IDS,
	SHORTKEY_PLACEHOLDERS,
	SHORTKEY_TYPES,
} from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/**
 * `/` 검색 패널 토글.
 * search input 포커스 중에는 checkIsInput이 true라 시트 키가 발화하지 않는다(검색어 입력).
 */
const registerSheetSearchKeys = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	registerSheetKeys(shortcuts, [
		defineSheetKey(
			SHORTKEY_IDS.SEARCH,
			() => {
				getActions().toggleSearch();
			},
			{
				placeholder: SHORTKEY_PLACEHOLDERS.SEARCH,
				type: SHORTKEY_TYPES.HOLD,
				preventDefault: true,
			},
		),
	]);
};

export { registerSheetSearchKeys };
