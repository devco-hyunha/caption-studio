import { normalizeElementColor } from './normalize-element-color';
import { valid } from './valid';

const wrapWithFont = (el: Element, color: string) => {
	el.removeAttribute('color');
	const font = document.createElement('font');
	font.setAttribute('color', color);
	el.parentNode?.insertBefore(font, el);
	font.appendChild(el);
};

/** DOM HTML → 자막 저장용 HTML */
const encodeHtml = (input: Element | null): string => {
	if (!input) return '';

	input.querySelectorAll('*').forEach((el) => {
		const color = normalizeElementColor(el);
		if (color) {
			el.removeAttribute('style');
			if (el.localName === 'font') {
				el.setAttribute('color', color);
			} else {
				wrapWithFont(el, color);
			}
		}
		Array.from(el.attributes).forEach((attr) => {
			try {
				if (attr.name !== 'color') el.removeAttribute(attr.name);
			} catch {
				/* ignore */
			}
		});
	});

	const text = input.innerHTML.replace(/\n/gi, '').replace(/\t/gi, '');
	const contents = valid(text);
	if (contents.length >= 4 && contents.lastIndexOf('<br>') === contents.length - 4) {
		return contents.slice(0, contents.length - 4);
	}
	return contents;
};

export { encodeHtml };
