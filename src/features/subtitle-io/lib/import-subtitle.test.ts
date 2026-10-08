import { describe, expect, it, vi, afterEach } from 'vitest';
import {
	detectFileFormat,
	importSubtitleFile,
	importSubtitleText,
} from './import-subtitle';

describe('detectFileFormat', () => {
	it('확장자로 smi/srt를 판별한다', () => {
		expect(detectFileFormat('a.smi')).toBe('smi');
		expect(detectFileFormat('b.SRT')).toBe('srt');
		expect(
			detectFileFormat(
				'[Ohys-Raws] Title - 01 (WOWOW 1280x720 x264 AAC).smi',
			),
		).toBe('smi');
		expect(detectFileFormat('note.txt')).toBeNull();
	});
});

describe('importSubtitleText', () => {
	it('SMI 텍스트를 시트(srt) 타임라인으로 변환한다', () => {
		const raw = `<SAMI>
<BODY>
<SYNC Start=1000><P Class=KRCC>가져오기 한글</P>
<SYNC Start=2000><P Class=KRCC>&nbsp;</P>
</BODY>
</SAMI>`;

		const result = importSubtitleText(raw, 'smi', 'srt');
		expect(result.format).toBe('srt');
		expect(result.timelines.length).toBeGreaterThan(0);
		expect(result.timelines.some((row) => row.text?.includes('가져오기 한글'))).toBe(
			true,
		);
	});

	it('SRT 텍스트를 시트(smi) 타임라인으로 변환한다', () => {
		const raw = [
			'1',
			'00:00:01,000 --> 00:00:02,000',
			'SRT 한글',
			'',
			'',
		].join('\r\n');

		const result = importSubtitleText(raw, 'srt', 'smi');
		expect(result.format).toBe('smi');
		expect(result.timelines.some((row) => row.text?.includes('SRT 한글'))).toBe(
			true,
		);
	});
});

describe('importSubtitleFile (FileReader encoding)', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('선택한 import 인코딩을 FileReader.readAsText에 넘긴다', async () => {
		const text = `<SAMI>
<BODY>
<SYNC Start=500><P Class=KRCC>인코딩 테스트</P>
<SYNC Start=1500><P Class=KRCC>&nbsp;</P>
</BODY>
</SAMI>`;
		const file = new File([text], 'sample.smi', { type: 'text/plain' });
		const seenEncoding: string[] = [];

		vi.stubGlobal(
			'FileReader',
			class {
				result: string | null = null;
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				readAsText(_blob: Blob, encoding?: string) {
					seenEncoding.push(encoding ?? '');
					this.result = text;
					this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
				}
			},
		);

		const result = await importSubtitleFile(file, 'smi', 'EUC-KR');
		expect(seenEncoding).toEqual(['EUC-KR']);
		expect(result.timelines.some((row) => row.text?.includes('인코딩 테스트'))).toBe(
			true,
		);
	});

	it('지원하지 않는 확장자는 에러', async () => {
		const file = new File(['x'], 'note.txt');
		await expect(importSubtitleFile(file, 'smi', 'UTF-8')).rejects.toThrow(
			'not-support-file-format',
		);
	});
});
