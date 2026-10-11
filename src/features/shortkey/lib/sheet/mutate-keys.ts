import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS, SHORTKEY_PLACEHOLDERS } from '../../model/default-sheet-shortkey-masks';
import { defineSheetKey, registerSheetKeys } from '../shortkey-keys';

/** Ctrl+Shift+A/D — 포커스 행 기준 삽입·삭제 (다중 선택 중에는 동작하지 않음) */
const registerSheetMutateKeys = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	registerSheetKeys(shortcuts, [
		defineSheetKey(
			SHORTKEY_IDS.SHEET_INSERT,
			(event) => {
				const actions = getActions();
				if (actions.isMultiple()) return;
				if (!actions.hasFocus()) return;
				event.preventDefault();
				actions.insertRow();
			},
			{ placeholder: SHORTKEY_PLACEHOLDERS.SHEET_INSERT },
		),
		defineSheetKey(
			SHORTKEY_IDS.SHEET_REMOVE,
			(event) => {
				const actions = getActions();
				if (actions.isMultiple()) return;
				if (!actions.hasFocus()) return;
				event.preventDefault();
				actions.removeRow();
			},
			{ placeholder: SHORTKEY_PLACEHOLDERS.SHEET_REMOVE },
		),
	]);
};

export { registerSheetMutateKeys };
