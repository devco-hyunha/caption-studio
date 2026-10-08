import type { SheetShortkeyActions, ShortcutParams, ShortcutsApi } from '../types';
import {
	SHORTKEY_IDS,
	SHORTKEY_PLACEHOLDERS,
	SHORTKEY_TYPES,
} from '../model/default-sheet-shortkey-masks';
import { useShortkeyStore } from '../model/use-shortkey-store';
import { checkIsInput } from './shortcuts';

/** IME 조합 중 keydown(특히 Tab 확정)은 네비게이션에서 무시 — 이중 이동 방지 */
const isImeKeyEvent = (event: KeyboardEvent) =>
	event.isComposing || event.keyCode === 229 || event.key === 'Process';

/** 시트 이동 · 에딧 · 선택 · insert/remove — mask는 shortkey store에서 조회 */
const registerSheetNavigationKeys = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	const { masks } = useShortkeyStore.getState();

	const keys: ShortcutParams[] = [
		{
			placeholder: SHORTKEY_PLACEHOLDERS.NEXT_ROW_MOVE,
			mask: masks[SHORTKEY_IDS.NEXT_ROW_MOVE],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().moveTabNext(event);
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.PREV_ROW_MOVE,
			mask: masks[SHORTKEY_IDS.PREV_ROW_MOVE],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().moveTabPrev(event);
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.SHEET_EDIT_ON,
			mask: masks[SHORTKEY_IDS.SHEET_EDIT_ON],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				if (!actions.isEditing() && actions.isTextTarget()) actions.beginEdit();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.SHEET_EDIT_OFF,
			mask: masks[SHORTKEY_IDS.SHEET_EDIT_OFF],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) {
					actions.toggleMultiple();
					return;
				}
				if (!actions.isEditing()) return;
				event.stopPropagation();
				actions.cancelEdit();
			},
		},
		{
			mask: masks[SHORTKEY_IDS.SHEET_EDIT_ENTER],
			type: SHORTKEY_TYPES.HOLD,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
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
			},
		},
		{
			mask: masks[SHORTKEY_IDS.PAGE_UP],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().movePagePrev(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.PAGE_DOWN],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().movePageNext(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.ROW_UP],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowPrev(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.ROW_DOWN],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowNext(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.ROW_UP_SELECT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowPrev(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.ROW_DOWN_SELECT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveRowNext(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.COL_LEFT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveColPrev(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.COL_RIGHT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.moveColNext(event);
			},
		},
		{
			mask: masks[SHORTKEY_IDS.ROW_SELECT_TOGGLE],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (!actions.isMultiple()) return;
				actions.toggleRowSelect();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.SHEET_INSERT,
			mask: masks[SHORTKEY_IDS.SHEET_INSERT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				actions.insertRow();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.SHEET_REMOVE,
			mask: masks[SHORTKEY_IDS.SHEET_REMOVE],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				actions.removeRow();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.FONT_BOLD,
			mask: masks[SHORTKEY_IDS.FONT_BOLD],
			type: SHORTKEY_TYPES.DOWN,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().applyTextFormat('bold');
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.FONT_ITALIC,
			mask: masks[SHORTKEY_IDS.FONT_ITALIC],
			type: SHORTKEY_TYPES.DOWN,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().applyTextFormat('italic');
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.FONT_UNDERLINE,
			mask: masks[SHORTKEY_IDS.FONT_UNDERLINE],
			type: SHORTKEY_TYPES.DOWN,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().applyTextFormat('underline');
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.UNDO,
			mask: masks[SHORTKEY_IDS.UNDO],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.undo();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.REDO,
			mask: masks[SHORTKEY_IDS.REDO],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isEditing()) return;
				actions.redo();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_JUMP,
			mask: masks[SHORTKEY_IDS.VIDEO_JUMP],
			type: SHORTKEY_TYPES.DOWN,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				actions.videoJump();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.SHEET_JUMP,
			mask: masks[SHORTKEY_IDS.SHEET_JUMP],
			type: SHORTKEY_TYPES.DOWN,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				actions.sheetJump();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_PLAY,
			mask: masks[SHORTKEY_IDS.VIDEO_PLAY],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				const actions = getActions();
				if (actions.isMultiple()) return;
				actions.videoPlayToggle();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_SEEK_PREV,
			mask: masks[SHORTKEY_IDS.VIDEO_SEEK_PREV],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().videoSeekPrev();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_SEEK_NEXT,
			mask: masks[SHORTKEY_IDS.VIDEO_SEEK_NEXT],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().videoSeekNext();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VOLUME_UP,
			mask: masks[SHORTKEY_IDS.VOLUME_UP],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().volumeUp();
			},
		},
		{
			placeholder: SHORTKEY_PLACEHOLDERS.VOLUME_DOWN,
			mask: masks[SHORTKEY_IDS.VOLUME_DOWN],
			type: SHORTKEY_TYPES.HOLD,
			preventDefault: true,
			handler: (event) => {
				if (isImeKeyEvent(event)) return;
				getActions().volumeDown();
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

/** printable → edit.on */
const bindPrintableEditCallback = (
	shortcuts: ShortcutsApi,
	getActions: () => SheetShortkeyActions,
) => {
	shortcuts.callback((event) => {
		if (checkIsInput(event.target)) return;
		const actions = getActions();
		if (actions.isEditing()) return;
		if (actions.isMultiple()) return;
		if (!actions.isTextTarget()) return;
		if (!isPrintableShortcutEvent(event)) return;
		actions.beginEditFromTyping(event);
	});
};

export { registerSheetNavigationKeys, bindPrintableEditCallback, isPrintableShortcutEvent };
