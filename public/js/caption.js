import i18nModule from './modules/i18n/i18n.js';
import subtitleModule from './modules/subtitle/index.js';
import videoModule from './modules/video/index.js';
import sheetModule from './modules/sheet/index.js';
import uiModule from './modules/ui/index.js';
import {
	storage,
	editHistory,
} from './modules/utils/index.js';

const i18n = i18nModule();
const subtitle = subtitleModule();
const video = videoModule();
const sheet = sheetModule();
const ui = uiModule();

var Do=$(document),Wn=$(window),Fn={},Shortkey=$.Shortcuts;

const initializeDomainModules = () => {
	ui.initialize({
		i18n,
		sheet,
		video,
		Fn,
		Shortkey,
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
};

	Shortkey.Default = [
		{
			placeholder : 'next-row-move', mask : 'tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!ui.layer){
					e.preventDefault();
					sheet.edit.state && sheet.edit.off();
					sheet.move.row.next(true);
					return false;
				}
			}
		}, {
			placeholder : 'prev-row-move', mask : 'shift+tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!ui.layer){
					e.preventDefault();
					sheet.edit.state && sheet.edit.off();
					sheet.move.row.prev();
					return false;
				}
			}
		}, {
			placeholder : 'sheet-edit-on', mask : 'f2', type : 'hold', isPrevented : true,
			handler : function(){
				if (!sheet.edit.state && !ui.layer && !sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo')) sheet.edit.on();
			}
		},  {
			placeholder : 'sheet-edit-off', mask : 'esc', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (ui.layer){
					ui.layout.querySelector('.overlay')?.click();
				} else if (sheet.multiple.state){
					sheet.multiple.toggle();
				} else if (sheet.edit.state) {
					sheet.edit.off();
				}
			}
		}, {
			mask : 'enter', type : 'hold',
			handler : function(e){
				if (ui.layer){
					e.preventDefault();
					ui.layout.querySelector('.dialog.on .btn-submit')?.click();
				} else if (sheet.edit.state){
					e.preventDefault();
					sheet.edit.cmd('enter');
				} else if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo')) {
					sheet.edit.on();
				}
			}
		}, {
			mask : 'pageup', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!ui.layer){
					sheet.move.page.prev();
				}
			}
		}, {
			mask : 'pagedown', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!ui.layer){
					sheet.move.page.next();
				}
			}
		}, {
			mask : 'up', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = false;
				if (ui.layer){
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.row.prev();
					}
				}
			}
		}, {
			mask : 'down', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = false;
				if (ui.layer){
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.row.next(false);
					}
				}
			}
		}, {
			mask : 'left', type : 'hold', isPrevented : true,
			handler : function(e){
				if (ui.layer){
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.col.prev();
					}
				}
			}
		}, {
			mask : 'right', type : 'hold', isPrevented : true,
			handler : function(e){
				if (ui.layer){
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.col.next();
					}
				}
			}
		}, {
			mask : 'shift+up', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = true;
				if (ui.layer){
					e.preventDefault();
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.row.prev();
					}
				}
			}
		}, {
			mask : 'shift+down', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = true;
				if (ui.layer){
					e.preventDefault();
				} else {
					if (!sheet.edit.state){
						e.preventDefault();
						sheet.move.row.next(false);
					}
				}
			}
		}, {
			mask : 'space', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = false;
				if (sheet.multiple.state){
					e.preventDefault();
					sheet.multiple.toggleRow(sheet.current.row);
				}
			}
		}, {
			placeholder : 'font-bold', mask : 'ctrl+b', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('bold');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('bold');
				}
			}
		}, {
			placeholder : 'font-italic', mask : 'ctrl+i', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('italic');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('italic');
				}
			}
		}, {
			placeholder : 'font-underline', mask : 'ctrl+u', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('underline');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('underline');
				}
			}
		}, {
			placeholder : 'undo', mask : 'ctrl+z', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!ui.layer && !sheet.edit.state){
					sheet.undo();
				}
			}
		}, {
			placeholder : 'redo', mask : 'ctrl+y', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!ui.layer && !sheet.edit.state){
					sheet.redo();
				}
			}
		}, {
			placeholder : 'volume-up', mask : 'ctrl+up', type : 'hold', isPrevented : true,
			handler : function(e){
				try{
					e.preventDefault();
					video.volume(video.volume() + 0.1);
				} catch (error){
					console.log(error);
				}
				return false;
			}
		}, {
			placeholder : 'volume-down', mask : 'ctrl+down', type : 'hold', isPrevented : true,
			handler : function(e){
				try{
					e.preventDefault();
					video.volume(video.volume() - 0.1);
				} catch (error){
					console.log(error);
				}
				return false;
			}
		}, {
			mask : 'backspace', type : 'hold', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !sheet.edit.state){
					sheet.edit.clip('clear');
				}
			}
		}, {
			mask : 'delete', type : 'hold', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !sheet.edit.state){
					sheet.edit.clip('clear');
				}
			}
		}, {
			placeholder : 'cut', mask : 'ctrl+x', type : 'down', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !sheet.edit.state){
					sheet.edit.clip();
				}
			}
		}, {
			placeholder : 'copy', mask : 'ctrl+c', type : 'down', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !sheet.edit.state){
					sheet.edit.clip();
				}
			}
		}, {
			placeholder : 'paste', mask : 'ctrl+v', type : 'down', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !sheet.edit.state){
					sheet.edit.clip();
				}
			}
		}
	];
	Shortkey.Custom = {
		'color0' : {
			placeholder : 'color-1', mask : 'ctrl+1', type : 'down', isPrevented : true, 
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color0');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color0');
				}
			}
		},
		'color1' : {
			placeholder : 'color-2', mask : 'ctrl+2', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color1');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color1');
				}
			}
		},
		'color2' : {
			placeholder : 'color-3', mask : 'ctrl+3', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color2');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color2');
				}
			}
		},
		'color3' : {
			placeholder : 'color-4', mask : 'ctrl+4', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color3');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color3');
				}
			}
		},
		'color4' : {
			placeholder : 'color-5', mask : 'ctrl+5', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color4');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color4');
				}
			}
		},
		'color5' : {
			placeholder : 'color-6', mask : 'ctrl+6', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color5');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color5');
				}
			}
		},
		'color6' : {
			placeholder : 'color-7', mask : 'ctrl+7', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color6');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color6');
				}
			}
		},
		'color7' : {
			placeholder : 'color-8', mask : 'ctrl+8', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color7');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color7');
				}
			}
		},
		'color_clear' : {
			placeholder : 'color-reset', mask : 'ctrl+9', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('color_clear');
				} else if (sheet.current.target == 'text' || sheet.current.target == 'memo'){
					sheet.edit.clip('color_clear');
				}
			}
		},
		'sheet-insert' : {
			placeholder : 'sheet-insert', mask : 'ctrl+shift+a', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				!sheet.multiple.state && sheet.command.insert(sheet.current);
				return false;
			}
		},
		'sheet-remove' : {
			placeholder : 'sheet-remove', mask : 'ctrl+shift+d', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				!sheet.multiple.state && sheet.command.remove(sheet.current);
				return false;
			}
		},
		'plus' :  {placeholder : 'time-plus', mask : 'ctrl+plus', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('plus');
				} else if (sheet.current.target == 'starttime' || sheet.current.target == 'endtime'){
					sheet.edit.timePlus();
				}
			}
		},
		'minus' :  {
			placeholder : 'time-minus', mask : 'ctrl+minus', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (sheet.multiple.state){
					sheet.edit.multiClip('minus');
				} else if (sheet.current.target == 'starttime' || sheet.current.target == 'endtime'){
					sheet.edit.timeMinus();
				}
			}
		}, 
		'carve' : {
			placeholder : 'time-carve', mask : 'ctrl+`', type : 'down', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state){
					$('.vjs-selecttime-control').trigger('click');
				}
				return false;
			}
		},
		'sheetJump' : {
			placeholder : 'move-current', mask : 'alt+q', type : 'down', isPrevented : true,
			handler : function(){
				if (!sheet.multiple.state && !isNaN(sheet.focus)) sheet.rowOffset(sheet.focus);
				return false;
			}
		},
		'videoJump' : {
			placeholder : 'timeline-current', mask : 'ctrl+q', type : 'down', isPrevented : true,
			handler : function(){
				try{
					if (!sheet.multiple.state){
						video.currentTime(sheet.timelines[sheet.current.row].start / 1000);
					}
				} catch (error){
					$('.video-import').trigger('click');
				}
				return false;
			}
		},
		'play' : {
			placeholder : 'play-stop', mask : 'ctrl+space', type : 'hold', isPrevented : true,
			handler : function(e){
				try{
					if (!sheet.multiple.state){
						e.preventDefault();
						video.toggle();
					}
				} catch (error){
					$('.video-import').trigger('click');
				}
				return false;
			}
		},
		'prev' : {
			placeholder : 'video-prev', mask : 'ctrl+left', type : 'hold', isPrevented : true,
			handler : function(){
				video.currentTime(video.currentTime() - 10);
				return false;
			}
		},
		'next' : {
			placeholder : 'video-next', mask : 'ctrl+right', type : 'hold', isPrevented : true,
			handler : function(){
				video.currentTime(video.currentTime() + 10);
				return false;
			}
		}
	};
	Shortkey.Switching = function(customKeys, defaultKeys, keyIndex, keyData, rowItem, keyEvent){
		customKeys = $('#custom-shortkey-list').empty();
		defaultKeys = $('#default-shortkey-list').empty();
		keyEvent = $.browser.opera ? 'keypress' : 'keydown';
		for (keyIndex in Shortkey.Custom){
			keyData = Shortkey.Custom[keyIndex];
			rowItem = '<li>';
			rowItem += '<form class="custom-shortkey" data-key="' + keyIndex + '">';
			rowItem += '<dl>';
			rowItem += '<dt>';
			rowItem += '<span class="i18n" data-text="'+ keyData.placeholder +'">' + i18n.t(keyData.placeholder) + '</span>';
			rowItem += '<button class="btn-change"><span class="i18n" data-text="change">'+ i18n.t('change') +'</span></button>';
			rowItem += '<a href="javascript:void(0)" class="btn-cancel"><span class="i18n" data-text="cancel">'+ i18n.t('cancel') +'</span></a>';
			rowItem += '</dt>';
			rowItem += '<dd><kbd>' + keyData.mask.replace(/\+/gi,' + ') + '</kbd><input type="text" class="i-text"/></dd>';
			rowItem += '</dl>';
			rowItem += '</form>';
			rowItem += '</li>';
			customKeys.append(rowItem);
		}
		for (keyIndex in Shortkey.Default){
			keyData = Shortkey.Default[keyIndex];
			if (keyData.placeholder){
				rowItem = '<li>';
				rowItem += '<dl>';
				rowItem += '<dt><span class="i18n" data-text="'+ keyData.placeholder +'">' + i18n.t(keyData.placeholder) + '</span></dt>';
				rowItem += '<dd><kbd>' + keyData.mask.replace(/\+/gi,' + ') + '</kbd></dd>';
				rowItem += '</dl>';
				rowItem += '</li>';
				defaultKeys.append(rowItem);
			}
		}
		$('.custom-shortkey').off('click').on('click','.btn-change',function(form){
			form = $(this).parents('.custom-shortkey');
			if (!form.hasClass('on')){
				form.addClass('on');
				form.find('.i-text').trigger('focus');
			} else {
				form.trigger('submit');
			}
			return false;
		}).on('click','.btn-cancel',function(form){
			form = $(this).parents('.custom-shortkey');
			if (form.hasClass('on')){
				form.removeClass('on');
			}
			return false;
		}).off(keyEvent).on(keyEvent,'.i-text',function(e, mask){
			e.preventDefault();
			if (e.which == 229 || e.which == 0 || e.key == 'unidentified'){
				ui.alert(i18n.t('not-support-shortkey1'));
				$(this).val('');
				return false;
			}
			mask = Shortkey.Convert(e);
			$(this).val(mask);
			return false;
		}).off('submit').on('submit',function(form, input, mask, key){
			form = $(this);
			input = form.find('.i-text');
			key = form.data('key');
			mask = form.find('.i-text').val();
			if ($.trim(mask) == ''){
				ui.alert(i18n.t('please-input-shortkey'));
				input.trigger('focus');
			} else if ($.trim(mask).length == 1){
				ui.alert(i18n.t('not-support-shortkey2'));
				input.trigger('focus');
			} else if($.Shortcuts.search(mask)){
				Shortkey.Custom[key].mask = mask;
				storage.set('customkey-'+key, mask);
				$.Shortcuts.removeAll();
				Shortkey.Init();
				form.removeClass('on');
				ui.success(i18n.t('config-saved'));
			} else {
				ui.alert(i18n.t('duplecation-shortkey'));
				input.trigger('focus');
			}
			return false;
		});
	};
	Shortkey.Convert = function(e, maskKey, specialKey, keyIndex, subKeyIndex, ekey, maskObj, mask){
		specialKey = $.Shortcuts.Code;
		for (keyIndex in specialKey){
			if(isNaN(specialKey[keyIndex])){
				for (subKeyIndex in specialKey[keyIndex]){
					if (specialKey[keyIndex][subKeyIndex] == e.which) maskKey = keyIndex;
				}
			} else {
				if (specialKey[keyIndex] == e.which) maskKey = keyIndex;
			}
		}
		ekey = e.which >= 48 && e.which <= 57 ? String.fromCharCode(e.which).toLowerCase() : e.key.toLowerCase();
		maskObj = {
			ctrl: e.ctrlKey,
			alt: e.altKey,
			shift: e.shiftKey,
			which: maskKey ? maskKey : (ekey != 'control' && ekey != 'alt' && ekey != 'shift' ? ekey : false) 
		};
		mask = '';
		if (maskObj.ctrl){
			if (mask.length > 0) mask += '+';
			mask += 'ctrl';
		}
		if (maskObj.alt){
			if (mask.length > 0) mask += '+';
			mask += 'alt';
		}
		if (maskObj.shift){
			if (mask.length > 0) mask += '+';
			mask += 'shift';
		}
		if (maskObj.which){
			if (mask.length > 0) mask += '+';
			mask += maskObj.which;
		}
		return (maskObj.which && mask != 'unidentified') ? mask : '';
	};
	Shortkey.Init = (function(key, keystr, defaultSize, defaultForIndex){
		defaultSize = Shortkey.Default.length;
		for (defaultForIndex = 0; defaultForIndex < defaultSize; defaultForIndex++){
			$.Shortcuts.add(Shortkey.Default[defaultForIndex]);
		}
		for (key in Shortkey.Custom){
			keystr = storage.get('customkey-'+key);
			if(keystr) Shortkey.Custom[key].mask = keystr;
			$.Shortcuts.add(Shortkey.Custom[key]);
		}
		$.Shortcuts.callback(function(e, keycode, regexp){
			keycode = e.keyCode ? e.keyCode : e.which;
			regexp = /[A-Za-o0-9`åÀ½»ÜÛÝºÞ¼¾¿]/;

			if (!ui.layer && $('.ui-dialog.on').length == 0 && !sheet.edit.state && !sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !e.ctrlKey && !e.altKey && (regexp.test(String.fromCharCode(keycode)) || 0 === keycode || keycode === Shortkey.Code.space)){
				sheet.edit.on();
			}
		});
		$.Shortcuts.start();
		Shortkey.Switching();
	});

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

		Shortkey.Init();
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
