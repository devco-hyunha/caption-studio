import i18nModule from './modules/i18n/i18n.js';
import subtitleModule from './modules/subtitle/index.js';
import videoModule from './modules/video/index.js';
import sheetModule from './modules/sheet/index.js';
import { trackEvent } from './modules/analytics/track.js';
import {
	storage,
	editHistory,
	clone,
	capitalize,
	extend,
	padZero,
	splitTimecode,
	formatTimecode,
	timePartsToMs,
	runAction,
} from './modules/utils/index.js';

const i18n = i18nModule();
const subtitle = subtitleModule();
const video = videoModule();
const sheet = sheetModule();

const getActionContext = () => ({
	video,
	import: subtitle.import,
	export: subtitle.export,
	Fn,
	Shortkey,
});

var Do=$(document),Wn=$(window),Interface={},Fn={},Shortkey=$.Shortcuts;

const initializeDomainModules = () => {
	sheet.initialize({
		i18n,
		header: subtitle.header,
		ui: Interface,
		subtitle,
	});
	video.initialize({ Interface, sheet, i18n });
	subtitle.initialize({ Interface, sheet, i18n });
};

	Interface.Wrap = $('#wrap');
	Interface.Layout = $('#layout');
	Interface.Alert = function(contents){
		Toast.error(contents);
	};
	Interface.Success = function(contents){
		Toast.success(contents);
	};
	Interface.Confirm = function(getOpt){
		var opt = {
			title : false,
			content : false,
			successBtn : i18n.t('yes'),
			cancelBtn : i18n.t('no'),
			bgDismiss : false,
			success : null,
			cancel : null
		};
		if (getOpt && typeof getOpt == 'object'){
			$.extend(opt, getOpt);
		}
		var cf = [], ev = [];
		cf.wrap = $('<div class="cf-wrap"></div>'),
		cf.overlay = $('<div class="cf-overlay"></div>').appendTo(cf.wrap),
		cf.box = $('<div class="cf-box"></div>').appendTo(cf.wrap);
		if (opt.title) $('<div class="cf-title"><span class="title">'+opt.title+'</span></div>').appendTo(cf.box);
		if (opt.content) $('<div class="cf-content">'+opt.content+'</div>').appendTo(cf.box);
		if (opt.successBtn || opt.cancelBtn) cf.btns = $('<div class="cf-btns"></div>').appendTo(cf.box);
		if (opt.successBtn) cf.success = $('<button class="btn-success tup">'+opt.successBtn+'</button>').appendTo(cf.btns);
		if (opt.cancelBtn) cf.cancel = $('<button class="btn-cancel tup">'+opt.cancelBtn+'</button>').appendTo(cf.btns);
		ev.close = function(process){
			if (process && opt[process]) opt[process]();
			for (let key in cf) cf[key].remove();
		};
		if (opt.bgDismiss){
			cf.overlay.on('click',function(){
				ev.close();
			});
		}
		if (cf.success){
			cf.success.on('click',function(){
				ev.close('success');
			});
		}
		if (cf.cancel){
			cf.cancel.on('click',function(){
				ev.close('cancel');
			});
		}
		$('body').append(cf.wrap);
		Interface.SwitchFocus(true);
	};
	Interface.SwitchFocus = function(key){
		if (!Interface.AnotherInput) Interface.AnotherInput = $('<input readonly />').addClass('another-input').appendTo($('body'));
		if (key){
			Interface.AnotherInput.trigger('focus');
		} else {
			sheet.active && sheet.active.target.indexOf('time') == -1 && sheet.trigger.input?.focus();
		}
	};
	Interface.Dialog = (function(target,tabHeader){
		if (target){
			if (Interface.Layout.hasClass('on')){
				Interface.Layer = false;
				Interface.Layout.find('.dialog.on').removeClass('on');
			} else {
				Interface.Layer = true;
				Interface.Layout.addClass('on');
			}
			target = Interface.Layout.find('#'+target);
			tabHeader = target.find('.tab-header');
			if (tabHeader.length > 0){
				tabHeader.children('li').eq(0).find('a').trigger('click');
			}
			target.addClass('on').find('input').eq(0).trigger('focus');
			Interface.SwitchFocus(true);
		} else {
			$('.dialog-trigger').off('click').on('click',function(trigger,target){
				trigger = $(this);
				target = trigger.data('target');
				Interface.Dialog(target);
				$('.nav-open').removeClass('nav-open');
			});
			Interface.Layout.find('.btn-close').add('.overlay').off('click').on('click',function(){
				Interface.Layout.removeClass('on');
				Interface.Layout.dialog = Interface.Layout.find('.dialog.on');
				Interface.Layout.dialog.find('.ui-tab').find('.tab-header > li > a').eq(0).trigger('click');
				Interface.Layout.dialog.removeClass('on');
				Interface.Layer = false;
			}).trigger('click');
			Interface.SwitchFocus();
		}
	});
	Interface.Tab = (function(){
		$('.ui-tab').each(function(eq,ui){
			$(ui)
			.on('click','.tab-header > li > a',function(tab,file,trigger,active,value,action,init){
				tab = $(ui);
				if (tab.hasClass('form')){
					tab.find('.btn-reset').trigger('click');
					file = tab.find('.i-text.file');
					if (file.length > 0){
						file.addClass('empty');
						file.find('.i-filename').text('');
					}
				}
				tab.find('.tab-header > li.on').removeClass('on');
				tab.find('.tab-panel.on').removeClass('on');

				trigger = $(this);
				active = trigger.parent().addClass('on').index();
				tab.find('.tab-panel').eq(active).addClass('on');
				value = trigger.data('value');
				action = trigger.data('action');
				init = tab.data('action');
				tab.data('value',value);
				if (action) runAction(action, getActionContext(), value);
				if (init) runAction(init, getActionContext(), value);
			})
			.find('.tab-header > li > a').eq(0).trigger('click');
		});
		$('.ui-toggle').each(function(eq,toggle){
			$(toggle)
			.on('click','.trigger',function(){
				$(this).parent('.ui-toggle').toggleClass('on');
			});
		});
	});
	Interface.Select = {
		Trigger : (function(k, v, i){
			k = $('.ui-select[data-key="'+k+'"]');
			if (v) k.find('[data-value="'+v+'"]').trigger('click');
			else k.find('[data-value]').eq(0).trigger('click');
		}),
		Init : (function(){
			$('.ui-select').each(function(eq,ui){
				$(ui)
				.on('click','.trigger',function(){
					$(this).parent('.ui-select').toggleClass('on');
				})
				.on('click','.option > li > a',function(option,parent,select,value,action){
					option = $(this);
					parent = option.parent();
					select = option.parents('.ui-select');
					parent.siblings('.current').removeClass('current');
					parent.addClass('current');
					value = option.data('value');
					select.find('.trigger').text(option.text());
					select.data('value', value);
					action = select.data('action');
					if (action) runAction(action, getActionContext(), value);
					select.removeClass('on');
					trackEvent({ category: 'Selection', action: select.data('key') + ' : ' + value, label: 'Selection' });
				})
				.on('mouseleave', function(){
					$(this).removeClass('on');
				});
			});
			$('.ui-toggle').each(function(eq,toggle){
				$(toggle).off('click')
				.on('click','.trigger',function(){
					$(this).parent('.ui-toggle').toggleClass('on');
					return false;
				});
			});
		})
	};
	Interface.InputFile = (function(){
		$('.i-text.file').each(function(eq,ui){
			$(ui).find('input[type="file"]').off('change').on('change',function(parent,file,filename,action){
				parent = $(this).parent();
				file = this.files[0];
				filename = parent.find('.i-filename');
				action = parent.data('action');
				if (file){
					parent.removeClass('empty');
					filename.text(file.name);
				} else {
					parent.addClass('empty');
					filename.text('');
				}
				if (action) runAction(action, getActionContext(), parent, file);
			});
		});
	});
	Interface.I18n = (function(){
		if (!i18n.getLocale()) return;
		$('.i18n').each(function(eq, ui, kA, k){
			ui = $(ui);
			kA = ui.data();
			for (k in kA){
				switch (k){
					case 'text': ui.text(i18n.t(kA[k]));break;
					case 'title': ui.attr('title', i18n.t(kA[k]));break;
					case 'placeholder': ui.attr('placeholder', i18n.t(kA[k]));break;
				}
			};
		});
		$('.ui-select').each(function(eq, select, value, option){
			select = $(select);
			value = select.data('value');
			if (!value) return;
			option = select.find('.option [data-value="'+value+'"]');
			if (option.length) select.find('.trigger').text(option.text());
		});
	});

	Shortkey.Default = [
		{
			placeholder : 'next-row-move', mask : 'tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!Interface.Layer){
					e.preventDefault();
					sheet.edit.state && sheet.edit.off();
					sheet.move.row.next(true);
					return false;
				}
			}
		}, {
			placeholder : 'prev-row-move', mask : 'shift+tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!Interface.Layer){
					e.preventDefault();
					sheet.edit.state && sheet.edit.off();
					sheet.move.row.prev();
					return false;
				}
			}
		}, {
			placeholder : 'sheet-edit-on', mask : 'f2', type : 'hold', isPrevented : true,
			handler : function(){
				if (!sheet.edit.state && !Interface.Layer && !sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo')) sheet.edit.on();
			}
		},  {
			placeholder : 'sheet-edit-off', mask : 'esc', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Interface.Layer){
					Interface.Layout.find('.overlay').trigger('click');
				} else if (sheet.multiple.state){
					sheet.multiple.toggle();
				} else if (sheet.edit.state) {
					sheet.edit.off();
				}
			}
		}, {
			mask : 'enter', type : 'hold',
			handler : function(e){
				if (Interface.Layer){
					e.preventDefault();
					Interface.Layout.find('.dialog.on').find('.btn-submit').trigger('click');
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
				if (!Interface.Layer){
					sheet.move.page.prev();
				}
			}
		}, {
			mask : 'pagedown', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer){
					sheet.move.page.next();
				}
			}
		}, {
			mask : 'up', type : 'hold', isPrevented : true,
			handler : function(e){
				sheet.shift = false;
				if (Interface.Layer){
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
				if (Interface.Layer){
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
				if (Interface.Layer){
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
				if (Interface.Layer){
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
				if (Interface.Layer){
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
				if (Interface.Layer){
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
				if (!Interface.Layer && !sheet.edit.state){
					sheet.undo();
				}
			}
		}, {
			placeholder : 'redo', mask : 'ctrl+y', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer && !sheet.edit.state){
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
				Interface.Alert(i18n.t('not-support-shortkey1'));
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
				Interface.Alert(i18n.t('please-input-shortkey'));
				input.trigger('focus');
			} else if ($.trim(mask).length == 1){
				Interface.Alert(i18n.t('not-support-shortkey2'));
				input.trigger('focus');
			} else if($.Shortcuts.search(mask)){
				Shortkey.Custom[key].mask = mask;
				storage.set('customkey-'+key, mask);
				$.Shortcuts.removeAll();
				Shortkey.Init();
				form.removeClass('on');
				Interface.Success(i18n.t('config-saved'));
			} else {
				Interface.Alert(i18n.t('duplecation-shortkey'));
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

			if (!Interface.Layer && $('.ui-dialog.on').length == 0 && !sheet.edit.state && !sheet.multiple.state && (sheet.current.target == 'text' || sheet.current.target == 'memo') && !e.ctrlKey && !e.altKey && (regexp.test(String.fromCharCode(keycode)) || 0 === keycode || keycode === Shortkey.Code.space)){
				sheet.edit.on();
			}
		});
		$.Shortcuts.start();
		Shortkey.Switching();
	});

	Fn.Format = (function(format,optionArray){
		if (format != sheet.format){
			Interface.Confirm({
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
					Interface.Select.Trigger('format',sheet.format);
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
		Interface.I18n();
		$('.nav-open').removeClass('nav-open');
	});
	Do.on('ready', function(){
		initializeDomainModules();
		Interface.Tab();
		Interface.Dialog();
		Interface.InputFile();
		Interface.Select.Init();
		sheet.init('#sheet');
		sheet.edit.timeControl();
		sheet.search.init();
		sheet.config.init();

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
				Interface.I18n();
				Interface.Select.Trigger('language',language);
				Interface.Select.Trigger('format',format);
				$('#nav-trigger').on('click',function(){
					Interface.Wrap.toggleClass('nav-open');
					if (Interface.Wrap.hasClass('nav-open')){
						Interface.SwitchFocus(true);
					}
				});
			})
		});
	});

var Toast;!function(t){function a(t,a,n){d("info",t,a,n)}function n(t,a,n){d("warning",t,a,n)}function i(t,a,n){d("error",t,a,n)}function o(t,a,n){d("success",t,a,n)}function d(a,n,i,o){void 0===o&&(o={}),o=$.extend({},t.defaults,o),s||(s=$("#toast-container"),0===s.length&&(s=$("<div>").attr("id","toast-container").appendTo($("body")))),o.width&&s.css({width:o.width});var d=$("<div>").addClass("toast").addClass("toast-"+a);if(i){var e=$("<div>").addClass("toast-title").append(i);d.append(e)}if(n){var r=$("<div>").addClass("toast-message").append(n);d.append(r)}o.displayDuration>0&&setTimeout(function(){d.fadeOut(o.fadeOutDuration,function(){d.remove()})},o.displayDuration),d.on("click",function(){d.remove()}),s.prepend(d)}t.defaults={width:"",displayDuration:2e3,fadeOutDuration:800},t.info=a,t.warning=n,t.error=i,t.success=o;var s}(Toast||(Toast={}));
