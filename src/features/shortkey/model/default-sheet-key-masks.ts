/** S1 시트 네비게이션·에딧 키 — mask · placeholder · type 상수 */

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
] as const;

export type SheetShortkeyId = (typeof SHEET_SHORTKEY_IDS)[number];

/** 레거시 defaultKeys mask와 동일 */
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
};

/** 레거시 defaultKeys placeholder (i18n) — 있는 키만 */
export const SHEET_SHORTKEY_PLACEHOLDERS = {
	nextRowMove: 'next-row-move',
	prevRowMove: 'prev-row-move',
	sheetEditOn: 'sheet-edit-on',
	sheetEditOff: 'sheet-edit-off',
} as const;

export const SHORTCUT_TYPE_HOLD = 'hold' as const;
export const SHORTCUT_TYPE_DOWN = 'down' as const;
