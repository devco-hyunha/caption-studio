/** 시트 네비·에딧·선택·CRUD 키 — id · mask · placeholder · type 상수 (S2) */

export const SHORTKEY_IDS = {
	NEXT_ROW_MOVE: 'nextRowMove',
	PREV_ROW_MOVE: 'prevRowMove',
	SHEET_EDIT_ON: 'sheetEditOn',
	SHEET_EDIT_OFF: 'sheetEditOff',
	SHEET_EDIT_ENTER: 'sheetEditEnter',
	PAGE_UP: 'pageUp',
	PAGE_DOWN: 'pageDown',
	ROW_UP: 'rowUp',
	ROW_DOWN: 'rowDown',
	COL_LEFT: 'colLeft',
	COL_RIGHT: 'colRight',
	ROW_UP_SELECT: 'rowUpSelect',
	ROW_DOWN_SELECT: 'rowDownSelect',
	ROW_SELECT_TOGGLE: 'rowSelectToggle',
	SHEET_INSERT: 'sheetInsert',
	SHEET_REMOVE: 'sheetRemove',
} as const;

export type SheetShortkeyId = (typeof SHORTKEY_IDS)[keyof typeof SHORTKEY_IDS];

/** defaultKeys mask 문자열 */
export const SHORTKEY_MASKS = {
	TAB: 'tab',
	SHIFT_TAB: 'shift+tab',
	F2: 'f2',
	ESC: 'esc',
	ENTER: 'enter',
	PAGE_UP: 'pageup',
	PAGE_DOWN: 'pagedown',
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
	SHIFT_UP: 'shift+up',
	SHIFT_DOWN: 'shift+down',
	SPACE: 'space',
	CTRL_SHIFT_A: 'ctrl+shift+a',
	CTRL_SHIFT_D: 'ctrl+shift+d',
} as const;

/** S2 defaultKeys mask */
export const DEFAULT_SHEET_SHORTKEY_MASKS: Record<SheetShortkeyId, string> = {
	[SHORTKEY_IDS.NEXT_ROW_MOVE]: SHORTKEY_MASKS.TAB,
	[SHORTKEY_IDS.PREV_ROW_MOVE]: SHORTKEY_MASKS.SHIFT_TAB,
	[SHORTKEY_IDS.SHEET_EDIT_ON]: SHORTKEY_MASKS.F2,
	[SHORTKEY_IDS.SHEET_EDIT_OFF]: SHORTKEY_MASKS.ESC,
	[SHORTKEY_IDS.SHEET_EDIT_ENTER]: SHORTKEY_MASKS.ENTER,
	[SHORTKEY_IDS.PAGE_UP]: SHORTKEY_MASKS.PAGE_UP,
	[SHORTKEY_IDS.PAGE_DOWN]: SHORTKEY_MASKS.PAGE_DOWN,
	[SHORTKEY_IDS.ROW_UP]: SHORTKEY_MASKS.UP,
	[SHORTKEY_IDS.ROW_DOWN]: SHORTKEY_MASKS.DOWN,
	[SHORTKEY_IDS.COL_LEFT]: SHORTKEY_MASKS.LEFT,
	[SHORTKEY_IDS.COL_RIGHT]: SHORTKEY_MASKS.RIGHT,
	[SHORTKEY_IDS.ROW_UP_SELECT]: SHORTKEY_MASKS.SHIFT_UP,
	[SHORTKEY_IDS.ROW_DOWN_SELECT]: SHORTKEY_MASKS.SHIFT_DOWN,
	[SHORTKEY_IDS.ROW_SELECT_TOGGLE]: SHORTKEY_MASKS.SPACE,
	[SHORTKEY_IDS.SHEET_INSERT]: SHORTKEY_MASKS.CTRL_SHIFT_A,
	[SHORTKEY_IDS.SHEET_REMOVE]: SHORTKEY_MASKS.CTRL_SHIFT_D,
};

/** placeholder (i18n) — 있는 키만 */
export const SHORTKEY_PLACEHOLDERS = {
	NEXT_ROW_MOVE: 'next-row-move',
	PREV_ROW_MOVE: 'prev-row-move',
	SHEET_EDIT_ON: 'sheet-edit-on',
	SHEET_EDIT_OFF: 'sheet-edit-off',
	SHEET_INSERT: 'sheet-insert',
	SHEET_REMOVE: 'sheet-remove',
} as const;

export const SHORTKEY_TYPES = {
	HOLD: 'hold',
	DOWN: 'down',
} as const;
