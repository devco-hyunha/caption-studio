/**
 * 레거시 `public/js/modules/shortkey/shortcuts.js` TS 포팅.
 * API: code · callback · start · stop · add · remove · removeAll · search
 */

import type { ShortcutKeyHandler, ShortcutParams, ShortcutType, ShortcutsApi } from '../types';

const INPUT_TYPES = ['text', 'password', 'file', 'search', 'number', 'url'] as const;

const MODIFIER_CODES = new Set([
	'ControlLeft',
	'ControlRight',
	'AltLeft',
	'AltRight',
	'ShiftLeft',
	'ShiftRight',
	'MetaLeft',
	'MetaRight',
]);

const normalizeMask = (mask: string) => String(mask).toLowerCase().replace(/\s+/g, '');

const createCodeMap = (): Record<string, string | string[]> => ({
	backspace: 'Backspace',
	tab: 'Tab',
	enter: 'Enter',
	pause: 'Pause',
	capslock: 'CapsLock',
	esc: 'Escape',
	space: 'Space',
	pageup: 'PageUp',
	pagedown: 'PageDown',
	end: 'End',
	home: 'Home',
	left: 'ArrowLeft',
	up: 'ArrowUp',
	right: 'ArrowRight',
	down: 'ArrowDown',
	insert: 'Insert',
	delete: 'Delete',
	f1: 'F1',
	f2: 'F2',
	f3: 'F3',
	f4: 'F4',
	f5: 'F5',
	f6: 'F6',
	f7: 'F7',
	f8: 'F8',
	f9: 'F9',
	f10: 'F10',
	f11: 'F11',
	f12: 'F12',
	';': 'Semicolon',
	comma: 'Comma',
	'.': 'Period',
	'?': 'Slash',
	'`': 'Backquote',
	'[': 'BracketLeft',
	'\\': 'Backslash',
	']': 'BracketRight',
	"'": 'Quote',
	minus: ['Minus', 'NumpadSubtract'],
	plus: ['Equal', 'NumpadAdd'],
});

const resolveTokenCodes = (
	token: string,
	codeMap: Record<string, string | string[]>,
): string | string[] => {
	if (codeMap[token] !== undefined) return codeMap[token];
	if (/^[a-z]$/i.test(token)) return `Key${token.toUpperCase()}`;
	if (/^[0-9]$/.test(token)) return `Digit${token}`;
	return token;
};

interface MaskObject {
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	code?: string | string[];
}

const getKey = (type: ShortcutType | string, maskObj: MaskObject) => {
	const key = [type, maskObj.ctrl && 'ctrl', maskObj.alt && 'alt', maskObj.shift && 'shift']
		.filter(Boolean)
		.join('_');

	const keyMaker = (base: string, code?: string) => {
		if (code && !MODIFIER_CODES.has(code)) return `${base}_${code}`;
		return base;
	};

	if (Array.isArray(maskObj.code)) {
		return maskObj.code.map((code) => keyMaker(key, code));
	}
	return keyMaker(key, maskObj.code);
};

const getMaskObject = (mask: string, codeMap: Record<string, string | string[]>): MaskObject => {
	const obj: MaskObject = {};
	mask.split('+').forEach((item) => {
		if (item === 'ctrl' || item === 'alt' || item === 'shift') {
			obj[item] = true;
			return;
		}
		obj.code = resolveTokenCodes(item, codeMap);
	});
	return obj;
};

/**
 * 진짜 텍스트 input만 — 시트 contenteditable은 제외 (Decision).
 */
const checkIsInput = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement) || !target.tagName) return false;
	const name = target.tagName.toLowerCase();
	if (name === 'textarea') return true;
	if (name !== 'input') return false;
	const type = 'type' in target ? String((target as HTMLInputElement).type) : '';
	return (INPUT_TYPES as readonly string[]).includes(type);
};

const forEachMaskKey = (
	params: Pick<ShortcutParams, 'mask' | 'type' | 'list'>,
	codeMap: Record<string, string | string[]>,
	iterate: (listName: string, key: string) => void,
) => {
	const type = params.type || 'down';
	const listNames = params.list ? params.list.replace(/\s+/g, '').split(',') : ['default'];
	const masks = params.mask.toLowerCase().replace(/\s+/g, '').split(',');

	listNames.forEach((listName) => {
		masks.forEach((mask) => {
			const maskObj = getMaskObject(mask, codeMap);
			let keys = getKey(type, maskObj);
			if (!Array.isArray(keys)) keys = [keys];
			keys.forEach((key) => iterate(listName, key));
		});
	});
};

const createShortcuts = (): ShortcutsApi => {
	const lists: Record<string, Record<string, ShortcutParams[]>> = {};
	const arrayParams: ShortcutParams[] = [];
	const pressed: Record<string, boolean> = {};
	let active: Record<string, ShortcutParams[]> | undefined;
	let isCallback: ShortcutKeyHandler | null = null;
	let isStarted = false;
	let handleKeyDown: ShortcutKeyHandler | null = null;
	let handleKeyUp: ShortcutKeyHandler | null = null;
	let clearPressed: (() => void) | null = null;

	const shortcuts = {} as ShortcutsApi;
	shortcuts.code = createCodeMap();

	const run = (type: ShortcutType, event: KeyboardEvent) => {
		if (!active) return;

		const maskObj: MaskObject = {
			ctrl: event.ctrlKey,
			alt: event.altKey,
			shift: event.shiftKey,
			code: event.code,
		};
		const key = getKey(type, maskObj);
		const matched = active[key as string];
		if (!matched) return;

		const isInput = checkIsInput(event.target);
		matched.forEach((shortcut) => {
			if (isInput && !shortcut.enableInInput) return;
			if (shortcut.preventDefault) event.preventDefault();
			shortcut.handler(event);
		});
	};

	shortcuts.callback = (callback) => {
		isCallback = callback;
	};

	shortcuts.start = (list) => {
		active = lists[list || 'default'];
		if (isStarted) return shortcuts;

		handleKeyDown = (event) => {
			const { code } = event;
			if (!pressed[code]) run('down', event);
			pressed[code] = true;
			run('hold', event);
			if (typeof isCallback === 'function') isCallback(event);
		};

		handleKeyUp = (event) => {
			pressed[event.code] = false;
			run('up', event);
		};

		clearPressed = () => {
			Object.keys(pressed).forEach((code) => {
				pressed[code] = false;
			});
		};

		document.addEventListener('keydown', handleKeyDown, true);
		document.addEventListener('keyup', handleKeyUp, true);
		window.addEventListener('blur', clearPressed);
		isStarted = true;
		return shortcuts;
	};

	shortcuts.stop = () => {
		if (handleKeyDown) document.removeEventListener('keydown', handleKeyDown, true);
		if (handleKeyUp) document.removeEventListener('keyup', handleKeyUp, true);
		if (clearPressed) window.removeEventListener('blur', clearPressed);
		handleKeyDown = null;
		handleKeyUp = null;
		clearPressed = null;
		isStarted = false;
		return shortcuts;
	};

	shortcuts.add = (params) => {
		if (!params.mask) throw new Error("shortcuts.add: required parameter 'params.mask' is undefined.");
		if (!params.handler) {
			throw new Error("shortcuts.add: required parameter 'params.handler' is undefined.");
		}

		arrayParams.push(params);
		forEachMaskKey(params, shortcuts.code, (listName, key) => {
			if (!lists[listName]) lists[listName] = {};
			const list = lists[listName];
			if (!list[key]) list[key] = [];
			list[key].push(params);
		});
		return shortcuts;
	};

	shortcuts.remove = (params) => {
		if (!params.mask) {
			throw new Error("shortcuts.remove: required parameter 'params.mask' is undefined.");
		}

		forEachMaskKey(params, shortcuts.code, (listName, key) => {
			if (!lists[listName]) return;
			delete lists[listName][key];
		});
		return shortcuts;
	};

	shortcuts.removeAll = () => {
		arrayParams.forEach((params) => {
			shortcuts.remove(params);
		});
		arrayParams.length = 0;
	};

	shortcuts.search = (str) => {
		const needle = normalizeMask(str);
		let result = true;
		let spaceCount = -1;
		arrayParams.forEach((params) => {
			if (normalizeMask(params.mask) !== needle) return;
			if (needle === 'space') {
				spaceCount += 1;
				if (spaceCount > 0) result = false;
				return;
			}
			result = false;
		});
		return result;
	};

	return shortcuts;
};

export { createShortcuts, normalizeMask, checkIsInput, getKey, getMaskObject, createCodeMap };
