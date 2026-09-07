import i18nModule from './i18n/i18n.js';
import createSubtitle from './subtitle/index.js';
import videoModule from './video/index.js';
import sheetModule from './sheet/index.js';
import uiModule from './ui/index.js';
import shortkeyModule from './shortkey/index.js';
import createSettings from './settings/index.js';
import { storage } from './utils/index.js';
import { loadLocale } from './i18n/migrateLanguage.js';

/**
 * 도메인 모듈을 생성·조립·mount한 뒤, WebFont 연동용 콜백을 담은 객체를 반환한다.
 *
 * @returns {{ onFontsActive: () => void }}
 */
const bootstrap = () => {
	const i18n = i18nModule();
	const video = videoModule();
	const sheet = sheetModule();
	const ui = uiModule();
	const shortkey = shortkeyModule();
	const subtitle = createSubtitle({ ui, sheet, i18n });
	const settings = createSettings({ ui, sheet, subtitle, i18n });

	ui.configure({
		i18n,
		sheet,
		video,
		settings,
		shortkey,
		get import() { return subtitle.import; },
		get export() { return subtitle.export; },
	});
	sheet.configure({
		i18n,
		header: subtitle.header,
		ui,
		subtitle,
	});
	video.configure({ ui, sheet, i18n });
	shortkey.configure({ ui, sheet, video, i18n });

	ui.mount();
	sheet.mount('#sheet');
	shortkey.mount();
	video.mount();

	const onFontsActive = () => {
		let format = storage.get('format');
		const language = loadLocale(storage);

		if (!format || format === '') format = sheet.format;
		i18n.setLanguage(language);
		ui.applyI18n();
		ui.select({ key: 'locale', value: language });
		ui.select({ key: 'format', value: format });

		document.querySelector('#nav-trigger')?.addEventListener('click', () => {
			ui.wrap.classList.toggle('nav-open');
			if (ui.wrap.classList.contains('nav-open')) {
				ui.switchFocus(true);
			}
		});
	};

	return { onFontsActive };
};

export { bootstrap };
export default bootstrap;
