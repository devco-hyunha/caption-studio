import bootstrap from './modules/index.js';

const onShellReady = (selector, handleReady) => {
	let isDone = false;

	const run = () => {
		if (isDone) return;
		if (!document.querySelector(selector)) return;
		isDone = true;
		observer.disconnect();
		handleReady();
	};

	const observer = new MutationObserver(run);

	if (document.querySelector(selector)) {
		run();
		return;
	}

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
};

onShellReady('#wrap', () => {
	globalThis.WebFont.load({
		custom: {
			families: ['Nanum Gothic', 'material-icons'],
			urls: ['//fonts.googleapis.com/earlyaccess/nanumgothic.css'],
		},
		google: {
			families: ['Droid+Serif:400,400italic,700,700italic'],
		},
		active: () => {
			const { onFontsActive } = bootstrap();
			onFontsActive()
		},
	});
});
