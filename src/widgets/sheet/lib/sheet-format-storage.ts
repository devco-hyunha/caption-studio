import type { SheetFormat } from '../types';

/** `/` `storage` 키와 동일 — 하이브리드 공유 */
const STORAGE_KEY_FORMAT = 'format';

/** 저장값 없을 때 `/edit` 기존 기본값 유지 */
const DEFAULT_SHEET_FORMAT: SheetFormat = 'srt';

const isSheetFormat = (value: unknown): value is SheetFormat =>
	value === 'smi' || value === 'srt';

/** localStorage `format` 로드. SSR·파싱 실패 시 기본값 */
const readStoredSheetFormat = (): SheetFormat => {
	if (typeof window === 'undefined') return DEFAULT_SHEET_FORMAT;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY_FORMAT);
		if (raw == null) return DEFAULT_SHEET_FORMAT;
		const parsed: unknown = JSON.parse(raw);
		return isSheetFormat(parsed) ? parsed : DEFAULT_SHEET_FORMAT;
	} catch {
		return DEFAULT_SHEET_FORMAT;
	}
};

/** `/` `storage.set('format', …)` 과 동일 JSON 직렬화 */
const writeStoredSheetFormat = (format: SheetFormat) => {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(STORAGE_KEY_FORMAT, JSON.stringify(format));
};

export {
	DEFAULT_SHEET_FORMAT,
	STORAGE_KEY_FORMAT,
	readStoredSheetFormat,
	writeStoredSheetFormat,
};
