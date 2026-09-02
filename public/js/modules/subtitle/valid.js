export const valid = (text) => {
	return text
		.replace(/<strong/gi, '<b')
		.replace(/<\/strong/gi, '<\/b')
		.replace(/<script/gi, '&lt;script')
		.replace(/<\/script/gi, '&gt;\/script')
		.replace(/<br \/>/gi, '<br>')
		.replace(/\t/gi, '')
		.replace(/<em/gi, '<i')
		.replace(/<\/em/gi, '<\/i')
		.replace(/<div>/gi, '')
		.replace(/<br><\/div>/gi, '<br>')
		.replace(/<\/div>/gi, '<br>')
		.replace(/<span>/gi, '')
		.replace(/<\/span>/gi, '')
		.replace(/<p>/gi, '')
		.replace(/<br><\/p>/gi, '<br>')
		.replace(/<\/p>/gi, '<br>');
};
