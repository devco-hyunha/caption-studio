/** 시트 네비·에딧·선택·mutate 키 — mask · placeholder · type 상수 */

export const SHEET_SHORTKEY_IDS = [
	'nextRowMove',
	'prevRowMove',
	'sheetEditOn',
	'sheetEditOff',
	'sheetEditEnter',
	'pageUp',
	'pageDown',
	'rowUp',
	'rowDown',
	'colLeft',
	'colRight',
	'rowUpSelect',
	'rowDownSelect',
	'rowSelectToggle',
	'sheetInsert',
	'sheetRemove',
	'fontBold',
	'fontItalic',
	'fontUnderline',
	'undo',
	'redo',
] as const;

export type SheetShortkeyId = (typeof SHEET_SHORTKEY_IDS)[number];

/** 레거시 defaultKeys / customKeys mask와 동일 */
export const DEFAULT_SHEET_KEY_MASKS: Record<SheetShortkeyId, string> = {
	nextRowMove: 'tab',
	prevRowMove: 'shift+tab',
	sheetEditOn: 'f2',
	sheetEditOff: 'esc',
	sheetEditEnter: 'enter',
	pageUp: 'pageup',
	pageDown: 'pagedown',
	rowUp: 'up',
	rowDown: 'down',
	colLeft: 'left',
	colRight: 'right',
	rowUpSelect: 'shift+up',
	rowDownSelect: 'shift+down',
	rowSelectToggle: 'space',
	sheetInsert: 'ctrl+shift+a',
	sheetRemove: 'ctrl+shift+d',
	fontBold: 'ctrl+b',
	fontItalic: 'ctrl+i',
	fontUnderline: 'ctrl+u',
	undo: 'ctrl+z',
	redo: 'ctrl+y',
};

/** 레거시 placeholder (i18n) — 있는 키만 */
export const SHEET_SHORTKEY_PLACEHOLDERS = {
	nextRowMove: 'next-row-move',
	prevRowMove: 'prev-row-move',
	sheetEditOn: 'sheet-edit-on',
	sheetEditOff: 'sheet-edit-off',
	sheetInsert: 'sheet-insert',
	sheetRemove: 'sheet-remove',
	fontBold: 'font-bold',
	fontItalic: 'font-italic',
	fontUnderline: 'font-underline',
	undo: 'undo',
	redo: 'redo',
} as const;

export const SHORTCUT_TYPE_HOLD = 'hold' as const;
export const SHORTCUT_TYPE_DOWN = 'down' as const;
