import { describe, expect, it } from 'vitest';
import { convertSheetTimelines } from './convert-sheet-timelines';

describe('convertSheetTimelines', () => {
	it('SRT → SMI 시 end를 제거한다', () => {
		const out = convertSheetTimelines(
			[{ start: 1000, end: 2000, text: 'a', memo: '' }],
			'srt',
			'smi',
		);

		expect(out[0]?.end).toBeUndefined();
		expect(out[0]?.text).toBe('a');
	});

	it('동일 포맷이면 복사본을 반환한다', () => {
		const input = [{ start: 1, text: 'x', memo: '' }];
		const out = convertSheetTimelines(input, 'smi', 'smi');
		expect(out).not.toBe(input);
		expect(out[0]?.text).toBe('x');
	});
});
