import { describe, expect, it } from 'vitest';
import { buildExcel } from './build-excel';

describe('buildExcel', () => {
	it('자막 탭마다 xlsx 워크시트를 만든다', () => {
		const bytes = buildExcel({
			sheetFormat: 'srt',
			columnFormat: 'srt',
			tabs: [
				{
					name: '첫 탭',
					timelines: [
						{ start: 1000, end: 2000, text: '탭1 한글', memo: '' },
					],
				},
				{
					name: '둘째',
					timelines: [
						{ start: 500, end: 1500, text: '탭2', memo: '메모' },
					],
				},
			],
		});

		expect(bytes.length).toBeGreaterThan(100);
		const text = new TextDecoder().decode(bytes);
		expect(text).toContain('sheet1.xml');
		expect(text).toContain('sheet2.xml');
		expect(text).toContain('첫 탭');
		expect(text).toContain('둘째');
		expect(text).toContain('탭1 한글');
	});
});
