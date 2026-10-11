/** shortkey 엔진 — 도메인 무관 범용 규격 */

export type ShortcutType = 'down' | 'hold' | 'up';

/** document keydown 핸들러 — React.KeyboardEvent와 구분 */
export type ShortcutKeyHandler = (event: KeyboardEvent) => void;

export interface ShortcutParams {
	mask: string;
	handler: ShortcutKeyHandler;
	type?: ShortcutType;
	list?: string;
	preventDefault?: boolean;
	enableInInput?: boolean;
	placeholder?: string;
}

/** mask token → event.code 맵 */
export interface CodeMap {
	[token: string]: string | string[];
}

/** mask 문자열을 파싱한 결과 — modifier · event.code */
export interface MaskObject {
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	code?: string | string[];
}

export interface ShortcutsApi {
	code: CodeMap;
	callback: (fn: ShortcutKeyHandler | null) => void;
	start: (list?: string) => ShortcutsApi;
	stop: () => ShortcutsApi;
	add: (params: ShortcutParams) => ShortcutsApi;
	remove: (params: Pick<ShortcutParams, 'mask' | 'type' | 'list'>) => ShortcutsApi;
	removeAll: () => void;
	search: (mask: string) => boolean;
}
