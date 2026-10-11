import { describe, expect, it } from 'vitest';
import type { SheetEditKeyProbe } from '../../types';
import { isImeStartKey, isPrintableKey, shouldBeginEditFromKey } from './edit-keys';

const base: SheetEditKeyProbe = {
	ctrlKey: false,
	altKey: false,
	metaKey: false,
	key: '',
	code: '',
};

describe('edit-keys', () => {
	it('isPrintableKey accepts single chars and Space, rejects modifiers/composing', () => {
		expect(isPrintableKey({ ...base, key: 'a', code: 'KeyA' })).toBe(true);
		expect(isPrintableKey({ ...base, key: ' ', code: 'Space' })).toBe(true);
		expect(isPrintableKey({ ...base, ctrlKey: true, key: 'a', code: 'KeyA' })).toBe(false);
		expect(isPrintableKey({ ...base, key: 'a', code: 'KeyA', isComposing: true })).toBe(false);
		expect(isPrintableKey({ ...base, key: 'ArrowRight', code: 'ArrowRight' })).toBe(false);
	});

	it('isImeStartKey detects composing, Process and keyCode 229', () => {
		expect(isImeStartKey({ ...base, key: 'a', isComposing: true })).toBe(true);
		expect(isImeStartKey({ ...base, key: 'Process' })).toBe(true);
		expect(isImeStartKey({ ...base, key: 'a', nativeEvent: { keyCode: 229 } })).toBe(true);
		expect(isImeStartKey({ ...base, key: 'a' })).toBe(false);
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
