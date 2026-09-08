/**
 * jquery.shortcuts.js (js-shortcuts v0.7 + Caption 확장)의 바닐라 포팅.
 * API: code · callback · start · stop · add · remove · removeAll · search
 *
 * 키 매칭: `event.code` (레거시 which/keyCode 대체)
 * 키 정의 옵션: `preventDefault` — 매칭 시 브라우저 기본 동작 막기
 */

const INPUT_TYPES = ['text', 'password', 'file', 'search', 'number', 'url'];
const MODIFIER_CODES = new Set([
	'ControlLeft', 'ControlRight',
	'AltLeft', 'AltRight',
	'ShiftLeft', 'ShiftRight',
	'MetaLeft', 'MetaRight',
]);

/**
 * mask 비교용 정규화 (소문자 · 공백 제거).
 * @param {string} mask
 * @returns {string}
 */
const normalizeMask = (mask) => String(mask).toLowerCase().replace(/\s+/g, '');

/**
 * mask 토큰 → KeyboardEvent.code (minus/plus는 본키+넘패드).
 * @returns {Record<string, string | string[]>}
 */
const createCodeMap = () => ({
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

/**
 * mask 토큰을 event.code(들)로 해석한다.
 * Code 맵에 없으면 KeyA / Digit1 형식으로 만든다.
 *
 * @param {string} token
 * @param {Record<string, string | string[]>} codeMap
 * @returns {string | string[]}
 */
const resolveTokenCodes = (token, codeMap) => {
	if (codeMap[token] !== undefined) return codeMap[token];
	if (/^[a-z]$/i.test(token)) return `Key${token.toUpperCase()}`;
	if (/^[0-9]$/.test(token)) return `Digit${token}`;
	return token;
};

const getKey = (type, maskObj) => {
	const key = [
		type,
		maskObj.ctrl && 'ctrl',
		maskObj.alt && 'alt',
		maskObj.shift && 'shift',
	].filter(Boolean).join('_');

	const keyMaker = (base, code) => {
		if (code && !MODIFIER_CODES.has(code)) return `${base}_${code}`;
		return base;
	};

	if (Array.isArray(maskObj.code)) {
		return maskObj.code.map((code) => keyMaker(key, code));
	}
	return keyMaker(key, maskObj.code);
};

const getMaskObject = (mask, codeMap) => {
	const obj = {};
	mask.split('+').forEach((item) => {
		if (item === 'ctrl' || item === 'alt' || item === 'shift') {
			obj[item] = true;
			return;
		}
		obj.code = resolveTokenCodes(item, codeMap);
	});
	return obj;
};

const checkIsInput = (target) => {
	if (!target || !target.tagName) return false;
	const name = target.tagName.toLowerCase();
	const type = target.type;
	if ((name === 'input' && INPUT_TYPES.includes(type)) || name === 'textarea') return true;
	return false;
};

/**
 * add/remove 공통: list·mask마다 내부 키를 순회한다.
 *
 * @param {object} params
 * @param {Record<string, string | string[]>} codeMap
 * @param {(listName: string, key: string) => void} iterate
 */
const forEachMaskKey = (params, codeMap, iterate) => {
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

/**
 * @returns {{
 *   code: Record<string, string | string[]>,
 *   callback: (fn: Function) => void,
 *   start: (list?: string) => object,
 *   stop: () => object,
 *   add: (params: object) => object,
 *   remove: (params: object) => object,
 *   removeAll: () => void,
 *   search: (mask: string) => boolean,
 * }}
 */
const createShortcuts = () => {
	const lists = {};
	const arrayParams = [];
	const pressed = {};
	let active;
	let isCallback;
	let isStarted = false;
	let handleKeyDown;
	let handleKeyUp;
	let clearPressed;

	const shortcuts = {};
	shortcuts.code = createCodeMap();

	const run = (type, event) => {
		if (!active) return;

		const maskObj = {
			ctrl: event.ctrlKey,
			alt: event.altKey,
			shift: event.shiftKey,
			code: event.code,
		};
		const key = getKey(type, maskObj);
		const matched = active[key];
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
		if (!params.handler) throw new Error("shortcuts.add: required parameter 'params.handler' is undefined.");

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
		if (!params.mask) throw new Error("shortcuts.remove: required parameter 'params.mask' is undefined.");

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

	/**
	 * mask가 아직 쓰이지 않으면 true (space는 1회까지 허용).
	 * 비교 전 소문자·공백 정규화.
	 * @param {string} str
	 * @returns {boolean}
	 */
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

export { createShortcuts, normalizeMask, checkIsInput };
