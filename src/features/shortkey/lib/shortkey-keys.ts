import type { ShortcutKeyHandler, ShortcutParams, ShortcutsApi, ShortcutType } from '@/shared/types/shortkey';
import { SHORTKEY_TYPES } from '../model/default-sheet-shortkey-masks';
import type { SheetShortkeyId } from '../model/default-sheet-shortkey-masks';
import { useShortkeyStore } from '../model/use-shortkey-store';

/** IME 조합 중 keydown(특히 Tab 확정)은 네비게이션에서 무시 — 이중 이동 방지 */
const isImeKeyEvent = (event: KeyboardEvent) =>
	event.isComposing || event.keyCode === 229 || event.key === 'Process';

/** mask는 shortkey store에서 조회, IME 가드를 일괄 적용한 키 정의 */
const defineSheetKey = (
	id: SheetShortkeyId,
	handler: ShortcutKeyHandler,
	options: { placeholder?: string; type?: ShortcutType } = {},
): ShortcutParams => ({
	placeholder: options.placeholder,
	mask: useShortkeyStore.getState().masks[id],
	type: options.type ?? SHORTKEY_TYPES.HOLD,
	handler: (event) => {
		if (isImeKeyEvent(event)) return;
		handler(event);
	},
});

const registerSheetKeys = (shortcuts: ShortcutsApi, keys: ShortcutParams[]) => {
	keys.forEach((entry) => shortcuts.add(entry));
};

export { defineSheetKey, isImeKeyEvent, registerSheetKeys };
