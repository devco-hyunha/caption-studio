import { describe, expect, it } from 'vitest';
import { isImeStartKey, isPrintableKey, shouldBeginEditFromKey } from './edit-keys';

const base = { ctrlKey: false, altKey: false, metaKey: false };

describe('edit-keys', () => {
	it('isPrintableKey accepts single chars and Space, rejects modifiers/composing', () => {
		expect(isPrintableKey({ ...base, key: 'a', code: 'KeyA' })).toBe(true);
		expect(isPrintableKey({ ...base, key: ' ', code: 'Space' })).toBe(true);
		expect(isPrintableKey({ ...base, ctrlKey: true, key: 'a', code: 'KeyA' })).toBe(false);
		expect(isPrintableKey({ ...base, key: 'a', code: 'KeyA', isComposing: true })).toBe(false);
		expect(isPrintableKey({ ...base, key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
	});

	it('isImeStartKey detects composing, Process and keyCode 229', () => {
		expect(isImeStartKey({ key: 'a', isComposing: true })).toBe(true);
		expect(isImeStartKey({ key: 'Process' })).toBe(true);
		expect(isImeStartKey({ key: 'a', nativeEvent: { keyCode: 229 } })).toBe(true);
		expect(isImeStartKey({ key: 'a' })).toBe(false);
	});

	it('shouldBeginEditFromKey: Enter always, modifiers block, IME/printable start', () => {
		expect(shouldBeginEditFromKey({ ...base, key: 'Enter', code: 'Enter' })).toBe(true);
		expect(shouldBeginEditFromKey({ ...base, ctrlKey: true, key: 'Enter', code: 'Enter' })).toBe(
			true,
		);
		expect(shouldBeginEditFromKey({ ...base, ctrlKey: true, key: 'a', code: 'KeyA' })).toBe(false);
		expect(shouldBeginEditFromKey({ ...base, key: 'a', code: 'KeyA' })).toBe(true);
		expect(shouldBeginEditFromKey({ ...base, key: 'Process', code: '' })).toBe(true);
		expect(shouldBeginEditFromKey({ ...base, key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
	});
});
