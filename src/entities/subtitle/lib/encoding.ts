import './ensure-buffer';
import iconv from 'iconv-lite';

/** UI 라벨 → iconv-lite 코덱 (`EUC-TW` → big5) */
const ENCODING_ALIASES: Record<string, string> = {
	'EUC-TW': 'big5',
};

const DEFAULT_ENCODING = 'UTF-8';
/** SMI 내보내기 기본 */
const DEFAULT_EXPORT_ENCODING_SMI = 'EUC-KR';
/** SRT 내보내기 기본 */
const DEFAULT_EXPORT_ENCODING_SRT = 'UTF-8';
/** VTT 내보내기 기본 */
const DEFAULT_EXPORT_ENCODING_VTT = 'UTF-8';
/** JSON 내보내기 기본 */
const DEFAULT_EXPORT_ENCODING_JSON = 'UTF-8';

const resolveEncoding = (encoding?: string | null): string => {
	if (!encoding) return 'utf8';
	return ENCODING_ALIASES[encoding] ?? encoding;
};

const encodeText = (
	text: string,
	encoding: string = DEFAULT_ENCODING,
): Uint8Array => {
	const bytes = iconv.encode(String(text ?? ''), resolveEncoding(encoding));
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
};

/**
 * FileReader.readAsText BOM 자동감지.
 * UTF-16 LE/BE · UTF-8 BOM이 있으면 UI 인코딩보다 우선.
 */
const sniffBomEncoding = (view: Uint8Array): string | null => {
	if (view.length >= 2 && view[0] === 0xff && view[1] === 0xfe) return 'utf16-le';
	if (view.length >= 2 && view[0] === 0xfe && view[1] === 0xff) return 'utf16-be';
	if (
		view.length >= 3 &&
		view[0] === 0xef &&
		view[1] === 0xbb &&
		view[2] === 0xbf
	) {
		return 'utf8';
	}
	return null;
};

/** BOM · UTF-8/UTF-16 경로는 Web `TextDecoder` 사용 */
const decodeViaTextDecoder = (
	view: Uint8Array,
	label: 'utf-8' | 'utf-16le' | 'utf-16be',
): string => new TextDecoder(label).decode(view);

const decodeBytes = (
	bytes: Uint8Array | ArrayBuffer,
	encoding: string = DEFAULT_ENCODING,
): string => {
	const view =
		bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
	const bomEncoding = sniffBomEncoding(view);

	if (bomEncoding === 'utf16-le') return decodeViaTextDecoder(view, 'utf-16le');
	if (bomEncoding === 'utf16-be') return decodeViaTextDecoder(view, 'utf-16be');
	if (bomEncoding === 'utf8') return decodeViaTextDecoder(view, 'utf-8');

	const resolved = resolveEncoding(encoding);
	if (resolved === 'utf8' || resolved === 'UTF-8') {
		return decodeViaTextDecoder(view, 'utf-8');
	}

	return iconv.decode(view, resolved);
};

const encodingExists = (encoding: string): boolean =>
	iconv.encodingExists(resolveEncoding(encoding));

/** Verify UI용 인코딩 목록 */
const SUBTITLE_ENCODINGS = [
	'UTF-8',
	'EUC-KR',
	'EUC-CN',
	'EUC-TW',
	'EUC-JP',
] as const;

export {
	DEFAULT_ENCODING,
	DEFAULT_EXPORT_ENCODING_SMI,
	DEFAULT_EXPORT_ENCODING_SRT,
	DEFAULT_EXPORT_ENCODING_VTT,
	DEFAULT_EXPORT_ENCODING_JSON,
	SUBTITLE_ENCODINGS,
	decodeBytes,
	encodeText,
	encodingExists,
	resolveEncoding,
	sniffBomEncoding,
};
