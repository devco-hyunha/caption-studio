import { describe, expect, it } from 'vitest';
import { countErrorRows, findErrorHits } from './error-hits';

describe('findErrorHits', () => {
	it('isError 행만 col 0 히트로 정렬해 만든다 (`/` errorRows parity)', () => {
		const rows = [
			{ index: 0, isError: false },
			{ index: 1, isError: true },
			{ index: 2, isError: false },
			{ index: 3, isError: true },
		];
		expect(findErrorHits(rows)).toEqual([
			{ row: 1, col: 0 },
			{ row: 3, col: 0 },
		]);
	});

	it('오류 없으면 빈 hits', () => {
		expect(findErrorHits([{ index: 0 }, { index: 1, isError: false }])).toEqual([]);
	});
});

describe('countErrorRows', () => {
	it('오류 개수를 센다', () => {
		expect(
			countErrorRows([
				{ index: 0, isError: true },
				{ index: 1, isError: true },
			]),
		).toBe(2);
		expect(countErrorRows([{ index: 0 }])).toBe(0);
	});
});
