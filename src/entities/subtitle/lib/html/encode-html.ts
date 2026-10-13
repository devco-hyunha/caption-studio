import { normalizeElementColor } from './normalize-element-color';
import { valid } from './valid';
import type { EncodeHtmlOptions } from '../../types';

const wrapWithFont = (el: Element, color: string) => {
	el.removeAttribute('color');
	const font = document.createElement('font');
	font.setAttribute('color', color);
	el.parentNode?.insertBefore(font, el);
	font.appendChild(el);
};

/** color 속성은 보존, 나머지 속성 제거 */
const stripAttributes = (el: Element) => {
	Array.from(el.attributes).forEach((attr) => {
		if (attr.name === 'color') return;
		try {
			el.removeAttribute(attr.name);
		} catch {
			/* ignore */
		}
	});
};

/** trailing `<br>` 한 개 제거 — split 규칙과 맞춤 */
const trimTrailingBr = (contents: string): string => {
	if (contents.length >= 4 && contents.lastIndexOf('<br>') === contents.length - 4) {
		return contents.slice(0, contents.length - 4);
	}
	return contents;
};

/**
 * DOM HTML → 자막 저장용 HTML.
 * `colorMode: 'font'` — color→`<font color>` 변환. `'keep'` — color 속성만 보존.
 * `clone: true` — 원본 DOM을 복제해서 변형하지 않는다.
 */
const encodeHtml = (input: Element | null, options: EncodeHtmlOptions = {}): string => {
	if (!input) return '';

	const { clone = false, colorMode = 'font' } = options;
	const root = clone ? (input.cloneNode(true) as Element) : input;

	root.querySelectorAll('*').forEach((el) => {
		if (colorMode === 'font') {
			const color = normalizeElementColor(el);
			if (color) {
				el.removeAttribute('style');
				if (el.localName === 'font') {
					el.setAttribute('color', color);
				} else {
					wrapWithFont(el, color);
				}
			}
		}
		stripAttributes(el);
	});

	const text = root.innerHTML.replace(/\n/gi, '').replace(/\t/gi, '');
	return trimTrailingBr(valid(text));
};

export { encodeHtml };
