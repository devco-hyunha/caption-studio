import { describe, expect, it } from 'vitest';
import { decodeBytes } from '@/entities/subtitle';
import { buildExportFile, buildFilename } from './export-subtitle';

describe('buildFilename', () => {
	it('확장자가 없으면 포맷 확장자를 붙인다', () => {
		expect(buildFilename('subtitle', 'smi')).toBe('subtitle.smi');
		expect(buildFilename('a.srt', 'srt')).toBe('a.srt');
		expect(buildFilename('a.vtt', 'vtt')).toBe('a.vtt');
		expect(buildFilename('out', 'json')).toBe('out.json');
		expect(buildFilename('book', 'excel')).toBe('book.xlsx');
		expect(buildFilename('  ', 'srt')).toBe('subtitle.srt');
	});
});

describe('buildExportFile (export encoding)', () => {
	const timelines = [
		{ start: 1000, end: 2000, text: '내보내기 한글', memo: '' },
	];

	it('SRT + UTF-8 인코딩으로 한글 payload·바이트를 만든다', () => {
		const built = buildExportFile({
			sheetFormat: 'srt',
			exportFormat: 'srt',
			timelines,
			encoding: 'UTF-8',
			filename: 'out',
		});

		expect(built.filename).toBe('out.srt');
		expect(built.payload).toContain('내보내기 한글');
		expect(decodeBytes(built.bytes, 'UTF-8')).toContain('내보내기 한글');
	});

	it('SMI + EUC-KR 인코딩으로 한글을 깨뜨리지 않는다', () => {
		const built = buildExportFile({
			sheetFormat: 'smi',
			exportFormat: 'smi',
			timelines: [
				{ start: 1000, text: '내보내기 한글', memo: '' },
				{ start: 2000, text: '', memo: '' },
			],
			encoding: 'EUC-KR',
			filename: 'out.smi',
		});

		expect(built.filename).toBe('out.smi');
		expect(built.payload).toContain('내보내기 한글');
		expect(decodeBytes(built.bytes, 'EUC-KR')).toContain('내보내기 한글');
	});

	it('sheetFormat과 exportFormat이 다르면 변환 후 인코딩한다', () => {
		const built = buildExportFile({
			sheetFormat: 'smi',
			exportFormat: 'srt',
			timelines: [
				{ start: 1000, text: '변환 한글', memo: '' },
				{ start: 2500, text: '', memo: '' },
			],
			encoding: 'UTF-8',
			filename: 'conv',
		});

		expect(built.filename).toBe('conv.srt');
		expect(built.payload).toContain('-->');
		expect(decodeBytes(built.bytes, 'UTF-8')).toContain('변환 한글');
	});

	it('SRT 스타일 제거 시 b/font 태그는 빼고 br은 유지한다', () => {
		const built = buildExportFile({
			sheetFormat: 'srt',
			exportFormat: 'srt',
			timelines: [
				{
					start: 1000,
					end: 2000,
					text: '<b>굵게</b><br><font color="#FF0000">빨강</font>',
					memo: '',
				},
			],
			encoding: 'UTF-8',
			filename: 'plain',
			removeStyle: true,
		});

		expect(built.payload).not.toContain('<b>');
		expect(built.payload).not.toContain('<font');
		expect(built.payload).toContain('굵게');
		expect(built.payload).toContain('빨강');
		expect(built.payload).toMatch(/굵게\r\n빨강/);
	});

	it('SRT/VTT/JSON은 encoding 인자와 무관하게 UTF-8로 인코딩한다', () => {
		const built = buildExportFile({
			sheetFormat: 'srt',
			exportFormat: 'srt',
			timelines,
			encoding: 'EUC-KR',
			filename: 'utf8',
		});

		expect(decodeBytes(built.bytes, 'UTF-8')).toContain('내보내기 한글');
	});

	it('VTT는 WEBVTT 헤더와 점 소수 타임코드를 쓴다', () => {
		const built = buildExportFile({
			sheetFormat: 'srt',
			exportFormat: 'vtt',
			timelines,
			encoding: 'UTF-8',
			filename: 'out',
		});

		expect(built.filename).toBe('out.vtt');
		expect(built.payload.startsWith('WEBVTT')).toBe(true);
		expect(built.payload).toContain('00:00:01.000 --> 00:00:02.000');
		expect(built.payload).toContain('내보내기 한글');
	});

	it('JSON은 자막 탭 전체를 sheets로 내보낸다', () => {
		const built = buildExportFile({
			sheetFormat: 'smi',
			exportFormat: 'json',
			timelines: [{ start: 1000, text: '무시', memo: '' }],
			workbookTabs: [
				{
					name: 'A',
					timelines: [
						{ start: 1000, text: 'JSON 한글', memo: '' },
						{ start: 2000, text: '', memo: '' },
					],
				},
				{ name: 'B', timelines: [{ start: 500, text: '둘', memo: '' }] },
			],
			encoding: 'UTF-8',
			filename: 'out',
			dataFormat: 'srt',
		});

		expect(built.filename).toBe('out.json');
		const parsed = JSON.parse(built.payload) as {
			sheets: Array<{
				name: string;
				timelines: Array<{ text: string; end?: number }>;
			}>;
		};
		expect(parsed.sheets).toHaveLength(2);
		expect(parsed.sheets[0]?.name).toBe('A');
		expect(parsed.sheets[0]?.timelines[0]?.text).toBe('JSON 한글');
		expect(parsed.sheets[0]?.timelines[0]?.end).toBeTypeOf('number');
		expect(parsed.sheets[1]?.name).toBe('B');
		expect(built.payload).toContain('\t');
	});

	it('Excel은 xlsx 바이트와 자막 탭 수만큼 worksheet를 만든다', () => {
		const built = buildExportFile({
			sheetFormat: 'srt',
			exportFormat: 'excel',
			timelines: [{ start: 0, end: 1000, text: 'x', memo: '' }],
			workbookTabs: [
				{ name: 'T1', timelines: [{ start: 1000, end: 2000, text: '엑셀', memo: '' }] },
				{ name: 'T2', timelines: [{ start: 500, end: 1500, text: '2', memo: '' }] },
			],
			encoding: 'UTF-8',
			filename: 'out',
			dataFormat: 'srt',
		});

		expect(built.filename).toBe('out.xlsx');
		expect(built.bytes.length).toBeGreaterThan(100);
		const zipText = new TextDecoder().decode(built.bytes);
		expect(zipText).toContain('sheet1.xml');
		expect(zipText).toContain('sheet2.xml');
	});
});
