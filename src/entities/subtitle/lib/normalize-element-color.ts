const toHexPair = (value: number) => {
	const hex = value.toString(16);
	return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (r: number, g: number, b: number) =>
	`#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`.toUpperCase();

const cssColorToHex = (cssColor: string) => {
	if (!cssColor) return '';
	const trimmed = cssColor.trim();
	if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return trimmed.toUpperCase();
	const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(trimmed);
	if (!match) return trimmed;
	return rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]));
};

const hasExplicitElementColor = (element: Element) => {
	if (element.getAttribute('color')) return true;
	const style = element.getAttribute('style');
	return Boolean(style && style.indexOf('color') === 0);
};

/** 명시적 color만 hex로 */
const normalizeElementColor = (element: Element): string => {
	if (!hasExplicitElementColor(element)) return '';

	const attrColor = element.getAttribute('color');
	if (attrColor) return cssColorToHex(attrColor);

	const style = element.getAttribute('style') || '';
	const styleMatch = /color\s*:\s*([^;]+)/i.exec(style);
	if (styleMatch) return cssColorToHex(styleMatch[1].trim());

	if (typeof document !== 'undefined' && document.contains(element)) {
		const computed = getComputedStyle(element).color;
		if (computed) return cssColorToHex(computed);
	}

	return '';
};

export { cssColorToHex, normalizeElementColor, rgbToHex };
