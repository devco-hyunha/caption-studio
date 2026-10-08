import { describe, expect, it } from 'vitest';
import {
	DEFAULT_EXPORT_ENCODING_SMI,
	DEFAULT_EXPORT_ENCODING_SRT,
	decodeBytes,
	encodeText,
	sniffBomEncoding,
} from './encoding';

describe('encoding defaults', () => {
	it('SMI 내보내기 기본은 EUC-KR, SRT는 UTF-8', () => {
		expect(DEFAULT_EXPORT_ENCODING_SMI).toBe('EUC-KR');
		expect(DEFAULT_EXPORT_ENCODING_SRT).toBe('UTF-8');
	});
});

describe('sniffBomEncoding', () => {
	it('UTF-16 LE / BE / UTF-8 BOM을 감지한다', () => {
		expect(sniffBomEncoding(new Uint8Array([0xff, 0xfe, 0x41, 0x00]))).toBe(
			'utf16-le',
		);
		expect(sniffBomEncoding(new Uint8Array([0xfe, 0xff, 0x00, 0x41]))).toBe(
			'utf16-be',
		);
		expect(sniffBomEncoding(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))).toBe(
			'utf8',
		);
		expect(sniffBomEncoding(new Uint8Array([0x41, 0x42]))).toBeNull();
	});
});

describe('encodeText / decodeBytes', () => {
	it('EUC-KR round-trip이 한글을 깨뜨리지 않는다', () => {
		const text = '한글 EUC-KR 테스트';
		expect(decodeBytes(encodeText(text, 'EUC-KR'), 'EUC-KR')).toBe(text);
	});

	it('UTF-8 round-trip', () => {
		const text = 'UTF-8 특수문자 ★☆';
		expect(decodeBytes(encodeText(text, 'UTF-8'), 'UTF-8')).toBe(text);
	});

	it('UTF-16 LE BOM은 UI 인코딩(UTF-8)과 무관하게 TextDecoder로 디코딩한다', () => {
		const payload = '<SAMI>\r\n<SYNC Start=1000><P Class=KRCC>한글</P>\r\n';
		const body = encodeText(payload, 'utf16-le');
		const withBom = new Uint8Array(2 + body.length);
		withBom[0] = 0xff;
		withBom[1] = 0xfe;
		withBom.set(body, 2);

		const decoded = decodeBytes(withBom, 'UTF-8');
		expect(decoded).toContain('<SAMI>');
		expect(decoded).toContain('<SYNC Start=1000>');
		expect(decoded).toContain('한글');
	});
});
