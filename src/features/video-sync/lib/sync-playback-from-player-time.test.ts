import { describe, expect, it } from 'vitest';
import { sameIndices } from './sync-playback-from-player-time';

describe('sameIndices', () => {
	it('길이와 값이 같으면 true', () => {
		expect(sameIndices([1, 3], [1, 3])).toBe(true);
		expect(sameIndices([], [])).toBe(true);
	});

	it('길이·값·순서가 다르면 false', () => {
		expect(sameIndices([1], [1, 2])).toBe(false);
		expect(sameIndices([1, 2], [2, 1])).toBe(false);
		expect(sameIndices([1], [2])).toBe(false);
	});
});
