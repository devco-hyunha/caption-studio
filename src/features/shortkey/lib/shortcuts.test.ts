import { describe, expect, it, vi } from 'vitest';
import {
	checkIsInput,
	createCodeMap,
	createShortcuts,
	getKey,
	getMaskObject,
	normalizeMask,
} from './shortcuts';

const dispatchKey = (
	type: 'keydown' | 'keyup',
	init: KeyboardEventInit & { code: string },
) => {
	const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init });
	document.dispatchEvent(event);
	return event;
};

describe('normalizeMask', () => {
	it('lowercases and strips spaces', () => {
		expect(normalizeMask('Ctrl + Z')).toBe('ctrl+z');
	});
});

describe('getMaskObject / getKey', () => {
	const codeMap = createCodeMap();

	it('maps tab / shift+tab / arrows to event.code keys', () => {
		expect(getMaskObject('tab', codeMap)).toEqual({ code: 'Tab' });
		expect(getMaskObject('shift+tab', codeMap)).toEqual({ shift: true, code: 'Tab' });
		expect(getMaskObject('up', codeMap)).toEqual({ code: 'ArrowUp' });
		expect(getKey('hold', getMaskObject('tab', codeMap))).toBe('hold_Tab');
		expect(getKey('hold', getMaskObject('shift+tab', codeMap))).toBe('hold_shift_Tab');
		expect(getKey('hold', getMaskObject('ctrl+z', codeMap))).toBe('hold_ctrl_KeyZ');
	});
});

describe('checkIsInput', () => {
	it('accepts text-like input and textarea only', () => {
		const text = document.createElement('input');
		text.type = 'text';
		const search = document.createElement('input');
		search.type = 'search';
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		const area = document.createElement('textarea');
		const div = document.createElement('div');
		div.contentEditable = 'true';

		expect(checkIsInput(text)).toBe(true);
		expect(checkIsInput(search)).toBe(true);
		expect(checkIsInput(area)).toBe(true);
		expect(checkIsInput(checkbox)).toBe(false);
		expect(checkIsInput(div)).toBe(false);
		expect(checkIsInput(null)).toBe(false);
	});
});

describe('createShortcuts matching', () => {
	it('fires hold handler on keydown and respects preventDefault', () => {
		const shortcuts = createShortcuts();
		const handler = vi.fn();
		shortcuts.add({ mask: 'tab', type: 'hold', preventDefault: true, handler });
		shortcuts.start();

		const event = dispatchKey('keydown', { code: 'Tab', key: 'Tab' });
		expect(handler).toHaveBeenCalledTimes(1);
		expect(event.defaultPrevented).toBe(true);

		shortcuts.stop();
		shortcuts.removeAll();
	});

	it('fires down only once per physical key until keyup', () => {
		const shortcuts = createShortcuts();
		const downHandler = vi.fn();
		const holdHandler = vi.fn();
		shortcuts.add({ mask: 'f2', type: 'down', handler: downHandler });
		shortcuts.add({ mask: 'f2', type: 'hold', handler: holdHandler });
		shortcuts.start();

		dispatchKey('keydown', { code: 'F2', key: 'F2' });
		dispatchKey('keydown', { code: 'F2', key: 'F2', repeat: true });
		expect(downHandler).toHaveBeenCalledTimes(1);
		expect(holdHandler).toHaveBeenCalledTimes(2);

		dispatchKey('keyup', { code: 'F2', key: 'F2' });
		dispatchKey('keydown', { code: 'F2', key: 'F2' });
		expect(downHandler).toHaveBeenCalledTimes(2);

		shortcuts.stop();
		shortcuts.removeAll();
	});

	it('skips handlers when target is a text input unless enableInInput', () => {
		const shortcuts = createShortcuts();
		const blocked = vi.fn();
		const allowed = vi.fn();
		shortcuts.add({ mask: 'enter', type: 'hold', handler: blocked });
		shortcuts.add({
			mask: 'esc',
			type: 'hold',
			enableInInput: true,
			handler: allowed,
		});
		shortcuts.start();

		const input = document.createElement('input');
		input.type = 'text';
		document.body.appendChild(input);

		input.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, code: 'Enter', key: 'Enter' }),
		);
		input.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				code: 'Escape',
				key: 'Escape',
			}),
		);

		expect(blocked).not.toHaveBeenCalled();
		expect(allowed).toHaveBeenCalledTimes(1);

		input.remove();
		shortcuts.stop();
		shortcuts.removeAll();
	});

	it('runs callback after hold matching', () => {
		const shortcuts = createShortcuts();
		const hold = vi.fn();
		const callback = vi.fn();
		shortcuts.add({ mask: 'a', type: 'hold', handler: hold });
		shortcuts.callback(callback);
		shortcuts.start();

		dispatchKey('keydown', { code: 'KeyA', key: 'a' });
		expect(hold).toHaveBeenCalled();
		expect(callback).toHaveBeenCalled();

		shortcuts.stop();
		shortcuts.removeAll();
	});
});
