import { normalizeElementColor } from '../utils/color.js';
import { valid } from './valid.js';

const wrapWithFont = (el, color) => {
	el.removeAttribute('color');
	const font = document.createElement('font');
	font.setAttribute('color', color);
	el.parentNode.insertBefore(font, el);
	font.appendChild(el);
};

/**
 * 편집기 DOM의 HTML을 자막 저장용 HTML로 정규화한다.
 * 색상은 `<font color>`로 변환하고, 불필요한 속성·태그를 제거한 뒤 `valid()`를 적용한다.
 *
 * @param {Element} input - 루트 Element
 * @returns {string} 정규화된 자막 HTML
 */
export const encode = (input) => {
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
			} catch (e) { }
		});
	});
	const text = input.innerHTML.replace(/\n/gi, '').replace(/\t/gi, '');
	const contents = valid(text);
	if (contents.length >= 4 && contents.lastIndexOf('<br>') === contents.length - 4) {
		return contents.slice(0, contents.length - 4);
	}
	return contents;
};
