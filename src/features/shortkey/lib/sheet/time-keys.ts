import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import {
	SHORTKEY_IDS,
	SHORTKEY_PLACEHOLDERS,
	SHORTKEY_TYPES,
} from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/**
 * time ±jump(Ctrl+Plus/Minus) — 다중 선택 일괄 nudge·single time 셀 nudge.
 * 다중·time 타깃 분기는 actions 훅에서 처리 (customKeys parity).
 */
const registerSheetTimeKeys = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	registerSheetKeys(shortcuts, [
		defineSheetKey(
			SHORTKEY_IDS.TIME_PLUS,
			() => {
				getActions().timePlus();
			},
			{
				placeholder: SHORTKEY_PLACEHOLDERS.TIME_PLUS,
				type: SHORTKEY_TYPES.HOLD,
				preventDefault: true,
			},
		),
		defineSheetKey(
			SHORTKEY_IDS.TIME_MINUS,
			() => {
				getActions().timeMinus();
			},
			{
				placeholder: SHORTKEY_PLACEHOLDERS.TIME_MINUS,
				type: SHORTKEY_TYPES.HOLD,
				preventDefault: true,
			},
		),
	]);
};

export { registerSheetTimeKeys };
