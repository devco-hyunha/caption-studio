import { describe, expect, it } from 'vitest';
import { resolveCommitValue } from './encode-cell-html';

describe('resolveCommitValue', () => {
	it('text/memo keeps encoded HTML as-is', () => {
		expect(resolveCommitValue('text', 'A<br>B', 'A\nB')).toBe('A<br>B');
		expect(resolveCommitValue('memo', '<b>hi</b>', 'hi')).toBe('<b>hi</b>');
	});

	it('time columns use innerText trim, fall back to encoded', () => {
		expect(resolveCommitValue('starttime', ' 00:00:01.000 ', ' 00:00:01.000 ')).toBe(
			'00:00:01.000',
		);
		expect(resolveCommitValue('dur', '00:00:01.000')).toBe('00:00:01.000');
		expect(resolveCommitValue('index', ' 2 ')).toBe('2');
	});
});
