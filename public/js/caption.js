import bootstrap from './modules/index.js';

const onDocumentReady = (handleReady) => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', handleReady);
		return;
	}
	handleReady();
};

onDocumentReady(() => {
	const { onFontsActive } = bootstrap();

	globalThis.WebFont.load({
		custom: {
			families: ['Nanum Gothic', 'material-icons'],
			urls: ['//fonts.googleapis.com/earlyaccess/nanumgothic.css', 'public/css/material-icons.css'],
		},
		google: {
			families: ['Droid+Serif:400,400italic,700,700italic'],
		},
		active: () => onFontsActive(),
	});
});
