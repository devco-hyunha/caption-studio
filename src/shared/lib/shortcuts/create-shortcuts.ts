import type { MaskObject, ShortcutKeyHandler, ShortcutParams, ShortcutType, ShortcutsApi } from '@/shared/types/shortkey';
import { checkIsInput } from './check-is-input';
import { createCodeMap } from './code-map';
import { forEachMaskKey, getKey, normalizeMask } from './mask';

/**
 * shortkey 엔진 — document capture keydown/keyup.
 * API: code · callback · start · stop · add · remove · removeAll · search
 */
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

export { createShortcuts };
