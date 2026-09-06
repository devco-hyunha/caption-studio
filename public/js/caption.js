import i18nModule from './modules/i18n/i18n.js';
import subtitleModule from './modules/subtitle/index.js';
import videoModule from './modules/video/index.js';
import sheetModule from './modules/sheet/index.js';
import uiModule from './modules/ui/index.js';
import shortkeyModule from './modules/shortkey/index.js';
import {
	storage,
	editHistory,
} from './modules/utils/index.js';

const i18n = i18nModule();
const subtitle = subtitleModule();
const video = videoModule();
const sheet = sheetModule();
const ui = uiModule();
const shortkey = shortkeyModule();

var Do=$(document),Wn=$(window),Fn={};

const initializeDomainModules = () => {
	ui.initialize({
		i18n,
		sheet,
		video,
		Fn,
		shortkey,
		get import() { return subtitle.import; },
		get export() { return subtitle.export; },
	});
	sheet.initialize({
		i18n,
		header: subtitle.header,
		ui,
		subtitle,
	});
	video.initialize({ ui, sheet, i18n });
	subtitle.initialize({ ui, sheet, i18n });
	shortkey.initialize({ ui, sheet, video, i18n });
};

	Fn.Format = (function(format,optionArray){
		if (format != sheet.format){
			ui.confirm({
				title:i18n.t('subtitle-format-change'),
				content :i18n.t('subtitle-format-change-contents'),
				bgDismiss:true,
				success:function(){
					storage.set('format',format);
					optionArray = {};
					if (sheet.format != format){
						optionArray = subtitle.converters[format](sheet.format, sheet.timelines);
						optionArray.Header = subtitle.header[format];
					}
					sheet.set(optionArray);
					sheet.current.row = 0;
					sheet.current.col = 0;
					sheet.move.event();
					editHistory.clear();
					sheet.edit.history();
				},
				cancel:function(){
					ui.select({ key: 'format', value: sheet.format });
				}
			});
		}
	});
	Fn.Language = (function(language){
		i18n.setLanguage(language);
		storage.set('language',language);
		sheet.set({
			language : language,
			Header : subtitle.header[sheet.format]
		});
		ui.applyI18n();
		$('.nav-open').removeClass('nav-open');
	});
	Do.on('ready', function(){
		initializeDomainModules();
		ui.init();
		sheet.init('#sheet');

		shortkey.init();
		video.init();
		WebFont.load({
			custom: {
				families: ['Nanum Gothic','material-icons'],
				urls: ['//fonts.googleapis.com/earlyaccess/nanumgothic.css','public/css/material-icons.css']
			},
			google: {
				families: ['Droid+Serif:400,400italic,700,700italic']
			},
			active: (function(color, format, language, data) {
				// option setting
				color		= storage.get('color');
				format		= storage.get('format');
				language	= storage.get('language');
				data		= storage.get('SUBTITLE_TEMP');

				if (!format || format == '') format = sheet.format;
				if (!language || language == '' || !i18n.getLocale(language)) language = sheet.language;
				i18n.setLanguage(language);
				ui.applyI18n();
				ui.select({ key: 'language', value: language });
				ui.select({ key: 'format', value: format });
				$('#nav-trigger').on('click',function(){
					ui.wrap.classList.toggle('nav-open');
					if (ui.wrap.classList.contains('nav-open')){
						ui.switchFocus(true);
					}
				});
			})
		});
	});
