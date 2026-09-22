/** 편집 HTML 정규화 — 레거시 `subtitle/valid.js`와 동일 */
const validCellHtml = (text: string) =>
	text
		.replace(/<strong/gi, '<b')
		.replace(/<\/strong/gi, '</b')
		.replace(/<script/gi, '&lt;script')
		.replace(/<\/script/gi, '&gt;/script')
		.replace(/<br \/>/gi, '<br>')
		.replace(/\t/gi, '')
		.replace(/<em/gi, '<i')
		.replace(/<\/em/gi, '</i')
		.replace(/<div>/gi, '')
		.replace(/<br><\/div>/gi, '<br>')
		.replace(/<\/div>/gi, '<br>')
		.replace(/<span>/gi, '')
		.replace(/<\/span>/gi, '')
		.replace(/<p>/gi, '')
		.replace(/<br><\/p>/gi, '<br>')
		.replace(/<\/p>/gi, '<br>');

/** contentEditable DOM → 저장용 HTML */

const encodeCellHtml = (input: HTMLElement | null | undefined): string => {
	if (!input) return '';

	const clone = input.cloneNode(true) as HTMLElement;
	clone.querySelectorAll('*').forEach((el) => {
		Array.from(el.attributes).forEach((attr) => {
			if (attr.name === 'color') return;
			try {
				el.removeAttribute(attr.name);
			} catch {
				// ignore
			}
		});
	});

	const text = clone.innerHTML.replace(/\n/gi, '').replace(/\t/gi, '');
	const contents = validCellHtml(text);
	if (contents.length >= 4 && contents.lastIndexOf('<br>') === contents.length - 4) {
		return contents.slice(0, contents.length - 4);
	}
	return contents;
};

export { encodeCellHtml, validCellHtml };
