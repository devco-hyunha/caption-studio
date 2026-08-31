const toHexPair = (value) => {
	const hex = value.toString(16);
	return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (r, g, b) => {
	return (`#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`).toUpperCase();
};

const cssColorToHex = (cssColor) => {
	if (!cssColor) return '';
	const trimmed = cssColor.trim();
	if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
		return trimmed.toUpperCase();
	}
	const match = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
	if (!match) return trimmed;
	return rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]));
};

const hasExplicitElementColor = (element) => {
	if (!element || element.nodeType !== 1) return false;
	if (element.getAttribute('color')) return true;
	const style = element.getAttribute('style');
	return Boolean(style && style.indexOf('color') === 0);
};

const normalizeElementColor = (element) => {
	if (!hasExplicitElementColor(element)) return '';

	const attrColor = element.getAttribute('color');
	if (attrColor) return cssColorToHex(attrColor);

	const style = element.getAttribute('style') || '';
	const styleMatch = style.match(/color\s*:\s*([^;]+)/i);
	if (styleMatch) return cssColorToHex(styleMatch[1].trim());

	if (typeof document !== 'undefined' && document.contains(element)) {
		const computed = getComputedStyle(element).color;
		if (computed) return cssColorToHex(computed);
	}

	return '';
};

export { cssColorToHex, rgbToHex, normalizeElementColor };
