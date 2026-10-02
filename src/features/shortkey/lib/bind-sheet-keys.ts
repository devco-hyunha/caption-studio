import type { SheetShortkeyActions, ShortcutParams, ShortcutsApi } from '../types';
import {
	SHEET_SHORTKEY_PLACEHOLDERS,
	SHORTCUT_TYPE_HOLD,
} from '../model/default-sheet-key-masks';
import { useShortkeyStore } from '../model/use-shortkey-store';
import { checkIsInput } from './shortcuts';

/** IME 조합 중 keydown(특히 Tab 확정)은 네비게이션에서 무시 — 이중 이동 방지 */
const isImeKeyEvent = (event: KeyboardEvent) =>
	event.isComposing || event.keyCode === 229 || event.key === 'Process';

/** S1: 이동 · 에딧 진입/종료만 — mask는 shortkey store에서 조회 */
const registerSheetNavigationKeys = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	const { masks } = useShortkeyStore.getState();

	const keys: ShortcutParams[] = [
		{
			placeholder: SHEET_SHORTKEY_PLACEHOLDERS.nextRowMove,
			mask: masks.nextRowMove,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().moveTabNext(event);
			},
		},
		{
			placeholder: SHEET_SHORTKEY_PLACEHOLDERS.prevRowMove,
			mask: masks.prevRowMove,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().moveTabPrev(event);
			},
		},
		{
			placeholder: SHEET_SHORTKEY_PLACEHOLDERS.sheetEditOn,
			mask: masks.sheetEditOn,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (!actions.isEditing() && actions.isTextTarget()) actions.beginEdit();
			},
		},
		{
			placeholder: SHEET_SHORTKEY_PLACEHOLDERS.sheetEditOff,
			mask: masks.sheetEditOff,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (!actions.isEditing()) return;
				event.stopPropagation();
				actions.cancelEdit();
			},
		},
		{
			mask: masks.sheetEditEnter,
			type: SHORTCUT_TYPE_HOLD,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) {
					event.preventDefault();
					event.stopPropagation();
					actions.insertEditorLineBreak();
					return;
				}
				if (!actions.isTextTarget()) return;
				event.preventDefault();
				event.stopPropagation();
				actions.beginEdit();
			},
		},
		{
			mask: masks.pageUp,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().movePagePrev(event);
			},
		},
		{
			mask: masks.pageDown,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().movePageNext(event);
			},
		},
		{
			mask: masks.rowUp,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowPrev(event);
			},
		},
		{
			mask: masks.rowDown,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowNext(event);
			},
		},
		{
			mask: masks.colLeft,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveColPrev(event);
			},
		},
		{
			mask: masks.colRight,
			type: SHORTCUT_TYPE_HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveColNext(event);
			},
		},
	];

	keys.forEach((entry) => {
		shortcuts.add(entry);
	});
};

const isPrintableShortcutEvent = (event: KeyboardEvent) => {
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (event.key.length === 1 || event.code === 'Space') return true;
	if (event.key === 'Process' || event.keyCode === 229) return true;
	if (event.isComposing) return true;
	return false;
};

/** 레거시 shortkey.callback — printable → edit.on */
const bindPrintableEditCallback = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	shortcuts.callback((event) => {
		if (checkIsInput(event.target)) return;
		const actions = getActions();
		if (actions.isEditing()) return;
		if (!actions.isTextTarget()) return;
		if (!isPrintableShortcutEvent(event)) return;
		actions.beginEditFromTyping(event);
	});
};

export { registerSheetNavigationKeys, bindPrintableEditCallback, isPrintableShortcutEvent };
