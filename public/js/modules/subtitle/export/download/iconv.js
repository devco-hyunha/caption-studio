const ENCODING_ALIASES = {
	'EUC-TW': 'big5',
};

const getIconv = () => {
	const iconv = globalThis.iconv;
	if (!iconv?.encode) {
		throw new Error('iconv-lite is not loaded');
	}
	return iconv;
};

/**
 * UI/PHP 인코딩 라벨을 iconv-lite 코덱 이름으로 맞춘다.
 * `EUC-TW`는 iconv-lite에 없어 `big5`로 매핑한다.
 *
 * @param {string} [encoding]
 * @returns {string}
 */
const resolveEncoding = (encoding) => {
	if (!encoding) return 'utf8';
	return ENCODING_ALIASES[encoding] ?? encoding;
};

/**
 * 문자열을 지정 인코딩의 바이트로 변환한다.
 *
 * @param {string} text
 * @param {string} [encoding='UTF-8']
 * @returns {Uint8Array}
 */
const encodeText = (text, encoding = 'UTF-8') => {
	const bytes = getIconv().encode(String(text ?? ''), resolveEncoding(encoding));
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
};

/**
 * 바이트를 지정 인코딩의 문자열로 디코딩한다.
 *
 * @param {Uint8Array|ArrayBuffer|Buffer} bytes
 * @param {string} [encoding='UTF-8']
 * @returns {string}
 */
const decodeBytes = (bytes, encoding = 'UTF-8') => {
	const iconv = getIconv();
	const buffer = globalThis.Buffer?.from
		? globalThis.Buffer.from(bytes)
		: bytes;
	return iconv.decode(buffer, resolveEncoding(encoding));
};

const encodingExists = (encoding) =>
	getIconv().encodingExists(resolveEncoding(encoding));

export { resolveEncoding, encodeText, decodeBytes, encodingExists };
