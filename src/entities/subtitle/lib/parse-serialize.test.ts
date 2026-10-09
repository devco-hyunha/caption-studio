import { describe, expect, it } from 'vitest';
import { parseSubtitleFile } from './convert';
import { formatExportData } from './format-export-data';
import { serializeSmi } from './serialize-smi';
import { serializeSrt } from './serialize-srt';
import { serializeVtt } from './serialize-vtt';
import { serializeJsonWorkbook } from './serialize-json';
import { parseSmiString } from './parse-smi';
import { parseSrtString } from './parse-srt';

describe('parseSrtString', () => {
	it('한글·특수문자가 있는 SRT를 ms·text로 파싱한다', () => {
		const raw = [
			'1',
			'00:00:01,000 --> 00:00:02,500',
			'안녕 <b>세계</b> &amp; 테스트',
			'',
			'2',
			'00:00:03,000 --> 00:00:04,000',
			'둘째 줄',
			'',
		].join('\r\n');

		const timelines = parseSrtString(raw);

		expect(timelines).toHaveLength(2);
		expect(timelines[0]?.start).toBe(1000);
		expect(timelines[0]?.end).toBe(2500);
		expect(timelines[0]?.text).toBe('안녕 <b>세계</b> &amp; 테스트');
		expect(timelines[1]?.text).toBe('둘째 줄');
	});

	it('마지막 cue가 빈 줄로 끝나지 않아도 flush한다', () => {
		const raw = [
			'1',
			'00:00:01,000 --> 00:00:02,000',
			'마지막 자막',
		].join('\r\n');

		const timelines = parseSrtString(raw);

		expect(timelines).toHaveLength(1);
		expect(timelines[0]?.text).toBe('마지막 자막');
		expect(timelines[0]?.start).toBe(1000);
	});
});

describe('parseSmiString', () => {
	it('한글 SYNC 블록을 start·text로 파싱한다', () => {
		const raw = `<SAMI>
<BODY>
<SYNC Start=1000><P Class=KRCC>안녕하세요</P>
<SYNC Start=2000><P Class=KRCC>&nbsp;</P>
</BODY>
</SAMI>`;

		const timelines = parseSmiString(raw);

		expect(timelines.length).toBeGreaterThanOrEqual(2);
		expect(timelines[0]?.start).toBe(1000);
		expect(timelines[0]?.text).toContain('안녕하세요');
		expect(timelines[1]?.start).toBe(2000);
	});
});

describe('parseSubtitleFile → serialize round-trip', () => {
	it('SRT → 시트(srt) → serializeSrt 로 한글이 유지된다', () => {
		// 빈 줄(`\r\n\r\n`)로 cue를 확정한다
		const raw = [
			'1',
			'00:00:00,500 --> 00:00:01,500',
			'한글 자막',
			'',
			'',
		].join('\r\n');

		const parsed = parseSubtitleFile('srt', raw, 'srt');
		const exportData = formatExportData({
			exportFormat: 'srt',
			sheetFormat: 'srt',
			sheetData: parsed.timelines,
		});
		const out = serializeSrt(exportData);

		expect(out).toContain('한글 자막');
		expect(out).toContain('00:00:00,500 --> 00:00:01,500');
	});

	it('SMI → 시트(smi) → serializeSmi 로 한글이 유지된다', () => {
		const raw = `<SAMI>
<BODY>
<SYNC Start=500><P Class=KRCC>한글 SMI</P>
<SYNC Start=1500><P Class=KRCC>&nbsp;</P>
</BODY>
</SAMI>`;

		const parsed = parseSubtitleFile('smi', raw, 'smi');
		const exportData = formatExportData({
			exportFormat: 'smi',
			sheetFormat: 'smi',
			sheetData: parsed.timelines,
		});
		const out = serializeSmi(exportData);

		expect(out).toContain('한글 SMI');
		expect(out).toContain('Start=500');
	});

	it('SRT 시트 → VTT 직렬화는 점 소수와 한글을 유지한다', () => {
		const raw = [
			'1',
			'00:00:00,500 --> 00:00:01,500',
			'한글 VTT',
			'',
			'',
		].join('\r\n');

		const parsed = parseSubtitleFile('srt', raw, 'srt');
		const exportData = formatExportData({
			exportFormat: 'vtt',
			sheetFormat: 'srt',
			sheetData: parsed.timelines,
		});
		const out = serializeVtt(exportData);

		expect(out.startsWith('WEBVTT')).toBe(true);
		expect(out).toContain('00:00:00.500 --> 00:00:01.500');
		expect(out).toContain('한글 VTT');
	});

	it('JSON workbook 직렬화는 탭·한글을 유지한다', () => {
		const timelines = formatExportData({
			exportFormat: 'json',
			sheetFormat: 'srt',
			sheetData: [{ start: 500, end: 1500, text: '한글 JSON', memo: '' }],
			dataFormat: 'srt',
		});
		const out = serializeJsonWorkbook({
			sheets: [{ name: 'Tab1', timelines }],
		});
		const parsed = JSON.parse(out) as {
			sheets: Array<{ name: string; timelines: Array<{ text: string }> }>;
		};

		expect(parsed.sheets[0]?.name).toBe('Tab1');
		expect(parsed.sheets[0]?.timelines[0]?.text).toBe('한글 JSON');
		expect(out).toContain('\t');
	});
});
