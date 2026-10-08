import { Buffer } from 'buffer';

/**
 * 브라우저에서 iconv-lite → safer-buffer가 Buffer.prototype에 접근한다.
 * encoding 모듈보다 먼저 평가되어야 한다.
 */
const root = globalThis as typeof globalThis & { Buffer?: typeof Buffer };

if (!root.Buffer) {
	root.Buffer = Buffer;
}

export {};
