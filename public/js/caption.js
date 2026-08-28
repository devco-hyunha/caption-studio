import i18nModule from './modules/i18n/i18n.js';

const i18n = i18nModule();

//;(function($,Do,Wn,WebFont,Shortkey,Player,Video,Interface,Ev,Fn,Sheet,SheetTrigger,Subtitle){
	var Do=$(document),Wn=$(window),Player={},Video={},Interface={},Fn={},Sheet={},SheetTrigger={},Shortkey=$.Shortcuts,Subtitle={},Ev={};

	Player.Wrap = $('#video');
	Player.Subtitle = $('#subtitle');
	Player.Target = 'player';
	Player.HTML = '<video id="player" class="video-js" playsinline controls></video>';

	Player.Support = (function(){
		
	});
	Player.youtube = (function(src){
		Player.Interface = videojs(Player.Target, {'techOrder': ['youtube','html5'], 'sources' : [{
			'type'	: 'video/youtube',
			'src'	: src
		}]});
	});
	Player.vimeo = (function(src){
		Player.Interface = videojs(Player.Target, {'techOrder': ['vimeo','html5'], 'sources' : [{
			'type'			: 'video/vimeo',
			'background'	: 1,
			'src'			: src
		}]});
	});
	Player.url = (function(src){
		if (Player.Element[0].canPlayType('video/'+src.split('.').pop()) != '') {
			Player.Element.prop('src',src);
			Player.Interface = videojs(Player.Target);
		} else {
			Interface.Alert(i18n.t('not-support-file-format'));
			Player.Refresh();
		}
	});
	Player.file = (function(file,url,format,src){
		url = window.URL || window.webkitURL;
		format = file ? Player.Element[0].canPlayType(file.type) : '';
		if (file && format != ''){
			src = url.createObjectURL(file);
			Player.Element.prop('src',src);
			Player.Interface = videojs(Player.Target);
		} else if (file && format == ''){
			Interface.Alert(i18n.t('not-support-file-format'));
			return false;
		}
	});
	Player.Empty = function(type, result){
		switch (type){
			case 'youtube' : result = i18n.t('please-input-youtube-url');break;
			case 'vimeo' : result = i18n.t('please-input-vimeo-url');break;
			case 'url' : result = i18n.t('please-input-video-url');break;
			case 'file' : result = i18n.t('please-select-video-file');break;
		}
		
		return result;
	};
	Player.Refresh = (function(){
		if (Player.Element){
			videojs(Player.Target).dispose();
			Player.Element = null;
		}
		if (Player.Interface) Player.Interface = null;
		if (Sheet.Focus || Sheet.Focus == 0) Sheet.Focus = null;
		Player.Wrap.find('.contain').append(Player.HTML);
		Player.Element = $('#'+Player.Target);
	});
	Player.Print = (function(sec){
		sec = Sheet.TimeSearch(parseInt(sec*1000));
		if (sec.timeline && !sec.timeline.endtime){
			sec.timeline.end = (sec.index + 1) <= Sheet.DataSize ? Sheet.ArrayData[sec.index + 1].start : Player.Interface.duration()*1000;
			sec.timeline.endtime = Fn.Hour(sec.timeline.end);
		}
		if (sec.visible){
			Player.Subtitle.addClass('visible');
		} else {
			Player.Subtitle.removeClass('visible');
		}
		if (sec.timeline && Sheet.Focus != sec.index){
			Sheet.Focus = sec.index;
			Sheet.Panel.find('.focus').removeClass('focus');
			Sheet.Panel.find('.row-'+ Sheet.Focus).addClass('focus');

			Player.Subtitle.find('.print').html(sec.timeline.text);
			Player.Subtitle.find('.current-line').text(sec.index + 1);
			Player.Subtitle.find('.current-start').text(sec.timeline.starttime);
			Player.Subtitle.find('.current-end').text(sec.timeline.endtime);
		}
	});

	Video.Init = (function(){
		Player.Refresh();
		$('.video-load').off('click').on('click',function(button,ui,type,input,data){
			button = $(this);
			ui = button.parents('.ui-tab');
			type = ui.data('value');
			input = ui.find('#video-'+type);
			if (type == 'file'){
				data = input[0].files[0];
			} else {
				data = input.val();
			}
			Video.Input(type, data);
		});
		Player.Subtitle
		.on('click','.move-current',function(){
			if (Sheet.Focus || Sheet.Focus == 0) Sheet.RowOffset(Sheet.Focus);
		}).on('click','.move-prev',function(focus, timeline){
			if (Sheet.Focus || Sheet.Focus == 0){
				focus		= Sheet.Focus > 0 ? (Sheet.Focus - 1) : 0;
				timeline	= Sheet.ArrayData[focus];
				Video.CurrentTime(timeline.start / 1000);
				Sheet.Draw();
			}
		}).on('click','.move-next',function(max, focus, timeline){
			if (Sheet.Focus || Sheet.Focus == 0){
				max			= Sheet.DataSize;
				focus		= Sheet.Focus < max ? (Sheet.Focus + 1) : max;
				timeline	= Sheet.ArrayData[focus];
				Video.CurrentTime(timeline.start / 1000);
				Sheet.Draw();
			}
		}).on('click','.subtitle-visible',function(){
			Player.Wrap.toggleClass('overlap');
			Fn.Data('set','subtitle-visible',Player.Wrap.hasClass('overlap'));
		});
		if (Fn.Data('get','subtitle-visible')) Player.Wrap.find('.subtitle-visible').trigger('click');
	});
	Video.FileCheck = (function(input, file, format){
		format = file ? Player.Element[0].canPlayType(file.type) : '';
		if (!file || (file && format == '')){
			input.addClass('empty');
			input.find('input[type="file"]').val('');
			input.find('.i-filename').text('');
			Interface.Alert(i18n.t('not-support-file-format'));
		}
	});
	Video.Input = (function(type, src){
		Player.Refresh();
		if (src && src != ''){
			Interface.Wrap.removeClass('empty');
			Player[type](src);
			Player.timeTrigger = $('<button class="vjs-selecttime-control vjs-control vjs-button mt icon-timer" type="button" aria-live="polite"><span class="vjs-control-text">select time</span></button>').appendTo('.vjs-control-bar');
			Player.timeTrigger.off('click').on('click',function(original,timeline,target){
				if (Sheet.Format == 'smi' && Sheet.Current.col > 0){
					Sheet.Current.col = 0;
					Sheet.Current.target = 'starttime';
					Sheet.Move.Event();
				}
				target = Sheet.Current.target;
				if (!Sheet.Multiple.State && target.indexOf('time') > 0){
					original = Sheet.ArrayData[Sheet.Current.row];
					timeline = Clone(original);
					if (target == 'starttime'){
						timeline.start = parseInt(Video.CurrentTime() * 1000);
					} else if (target == 'endtime'){
						timeline.end = parseInt(Video.CurrentTime() * 1000);
					}
					Sheet.Command.u(Sheet.Current,timeline);
				}
			});
			Player.Interface.on('ended',function(){
				Player.Print(-1);
			});
			Player.Interface.on('timeupdate',function(){
				Player.Print(this.currentTime());
			});
			Interface.Dialog();
			ga("send",{hitType:"event",eventCategory:"Player",eventAction:type + " Input",eventLabel:"Video Input"});
		} else {
			Interface.Wrap.addClass('empty');
			Interface.Alert(Player.Empty(type));
		}
	});
	Video.Play = (function(){Player.Interface.play();});
	Video.Pause = (function(){Player.Interface.pause();});
	Video.Paused = (function(){return Player.Interface.paused();});
	Video.Toggle = (function(){if (Video.Paused()) Video.Play(); else Video.Pause();});
	Video.Volume = (function(s){
		if (!Player.Interface) return 0;
		if (s || s == 0){
			s = s <= 0 ? 0 : (s > 1 ? 1 : s);
			Player.Interface.volume(s);
			return s;
		} else {
			return Player.Interface.volume();
		}
	});
	Video.VolumeUp = (function(s,volume){
		if (s || s == 0){
			volume = Video.Volume();
			volume += s;
			return Video.Volume(volume);
		}
	});
	Video.VolumeDown = (function(s,volume){
		if (s || s == 0){
			volume = Video.Volume();
			volume -= s;
			return Video.Volume(volume);
		}
	});
	Video.CurrentTime = (function(s){
		if (!Player.Interface) return 0;
		if (s){
			Player.Interface.currentTime(s);
			return s;
		} else {
			return Player.Interface.currentTime();
		}
	});

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
			for (key in cf) cf[key].remove();
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
			Sheet.Active && Sheet.Active.target.indexOf('time') == -1 && SheetTrigger.Input && SheetTrigger.Input.trigger('focus');
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
			.on('click','.tab-header > li > a',function(tab,file,trigger,active,value,callback,init){
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
				callback = trigger.data('callback');
				init = tab.data('callback');
				tab.data('value',value);
				if (callback){
					callback = eval(callback);
					if (typeof callback == 'function') callback(value);
				}
				if (init){
					init = eval(init);
					if (typeof init == 'function') init(value);
				}
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
				.on('click','.option > li > a',function(option,parent,select,value,callback){
					option = $(this);
					parent = option.parent();
					select = option.parents('.ui-select');
					parent.siblings('.current').removeClass('current');
					parent.addClass('current');
					value = option.data('value');
					select.find('.trigger').text(option.text());
					select.data('value', value);
					callback = select.data('callback');
					if (callback){
						callback = eval(callback);
						if (typeof callback == 'function') callback(value);
					}
					select.removeClass('on');
					ga("send",{hitType:"event",eventCategory:"Selection",eventAction:select.data('key') + " : " + value,eventLabel:"Selection"});
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
			$(ui).find('input[type="file"]').off('change').on('change',function(parent,file,filename,callback){
				parent = $(this).parent();
				file = this.files[0];
				filename = parent.find('.i-filename');
				callback = parent.data('callback');
				if (file){
					parent.removeClass('empty');
					filename.text(file.name);
				} else {
					parent.addClass('empty');
					filename.text('');
				}
				if (callback){
					callback = eval(callback);
					if (typeof callback == 'function') callback(parent, file);
				}
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

	Ev={
		Resize		: 'orientationchange' in window?'orientationchange':'resize',
		Scroll		: 'scroll.Sheet',
		ScrollEnd	: 'scrollend.Sheet',
		Blur		: 'click.SheetBlur',
		Click		: 'click.Sheet',
		Down		: 'mousedown.Sheet',
		DblClick	: 'dblclick.Sheet',
		Context		: 'contextmenu.Sheet',
		ClickCount	: 0
	};

	Shortkey.Default = [
		{
			placeholder : 'next-row-move', mask : 'tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!Interface.Layer){
					e.preventDefault();
					Sheet.Edit.State && Sheet.Edit.Off();
					Sheet.Move.Row.Next(true);
					return false;
				}
			}
		}, {
			placeholder : 'prev-row-move', mask : 'shift+tab', type : 'hold', isPrevented : true,
			handler : function(e){
				if (!Interface.Layer){
					e.preventDefault();
					Sheet.Edit.State && Sheet.Edit.Off();
					Sheet.Move.Row.Prev();
					return false;
				}
			}
		}, {
			placeholder : 'sheet-edit-on', mask : 'f2', type : 'hold', isPrevented : true,
			handler : function(){
				if (!Sheet.Edit.State && !Interface.Layer && !Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo')) Sheet.Edit.On();
			}
		},  {
			placeholder : 'sheet-edit-off', mask : 'esc', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Interface.Layer){
					Interface.Layout.find('.overlay').trigger('click');
				} else if (Sheet.Multiple.State){
					Sheet.Multiple.Toggle();
				} else if (Sheet.Edit.State) {
					Sheet.Edit.Off();
				}
			}
		}, {
			mask : 'enter', type : 'hold',
			handler : function(e){
				if (Interface.Layer){
					e.preventDefault();
					Interface.Layout.find('.dialog.on').find('.btn-submit').trigger('click');
				} else if (Sheet.Edit.State){
					e.preventDefault();
					Sheet.Edit.Cmd('enter');
				} else if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo')) {
					Sheet.Edit.On();
				}
			}
		}, {
			mask : 'pageup', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer){
					Sheet.Move.Page.Prev('true');
				}
			}
		}, {
			mask : 'pagedown', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer){
					Sheet.Move.Page.Next(false,'true');
				}
			}
		}, {
			mask : 'up', type : 'hold', isPrevented : true,
			handler : function(e){
				Sheet.Shift = false;
				if (Interface.Layer){
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Row.Prev('true');
					}
				}
			}
		}, {
			mask : 'down', type : 'hold', isPrevented : true,
			handler : function(e){
				Sheet.Shift = false;
				if (Interface.Layer){
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Row.Next(false,'true');
					}
				}
			}
		}, {
			mask : 'left', type : 'hold', isPrevented : true,
			handler : function(e){
				if (Interface.Layer){
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Col.Prev('true');
					}
				}
			}
		}, {
			mask : 'right', type : 'hold', isPrevented : true,
			handler : function(e){
				if (Interface.Layer){
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Col.Next('true');
					}
				}
			}
		}, {
			mask : 'shift+up', type : 'hold', isPrevented : true,
			handler : function(e){
				Sheet.Shift = true;
				if (Interface.Layer){
					e.preventDefault();
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Row.Prev('false');
					}
				}
			}
		}, {
			mask : 'shift+down', type : 'hold', isPrevented : true,
			handler : function(e){
				Sheet.Shift = true;
				if (Interface.Layer){
					e.preventDefault();
				} else {
					if (!Sheet.Edit.State){
						e.preventDefault();
						Sheet.Move.Row.Next(false,'false');
					}
				}
			}
		}, {
			mask : 'space', type : 'hold', isPrevented : true,
			handler : function(e){
				Sheet.Shift = false;
				if (Sheet.Multiple.State){
					e.preventDefault();
					Sheet.Multiple.Checking(Sheet.Current.row);
				}
			}
		}, {
			placeholder : 'font-bold', mask : 'ctrl+b', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('bold');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('bold');
				}
			}
		}, {
			placeholder : 'font-italic', mask : 'ctrl+i', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('italic');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('italic');
				}
			}
		}, {
			placeholder : 'font-underline', mask : 'ctrl+u', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('underline');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('underline');
				}
			}
		}, {
			placeholder : 'undo', mask : 'ctrl+z', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer && !Sheet.Edit.State){
					Sheet.Undo();
				}
			}
		}, {
			placeholder : 'redo', mask : 'ctrl+y', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (!Interface.Layer && !Sheet.Edit.State){
					Sheet.Redo();
				}
			}
		}, {
			placeholder : 'volume-up', mask : 'ctrl+up', type : 'hold', isPrevented : true,
			handler : function(e){
				try{
					e.preventDefault();
					Video.Volume(Video.Volume() + 0.1);
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
					Video.Volume(Video.Volume() - 0.1);
				} catch (error){
					console.log(error);
				}
				return false;
			}
		}, {
			mask : 'backspace', type : 'hold', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !Sheet.Edit.State){
					Sheet.Edit.Clip('clear');
				}
			}
		}, {
			mask : 'delete', type : 'hold', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !Sheet.Edit.State){
					Sheet.Edit.Clip('clear');
				}
			}
		}, {
			placeholder : 'cut', mask : 'ctrl+x', type : 'down', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !Sheet.Edit.State){
					Sheet.Edit.Clip();
				}
			}
		}, {
			placeholder : 'copy', mask : 'ctrl+c', type : 'down', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !Sheet.Edit.State){
					Sheet.Edit.Clip();
				}
			}
		}, {
			placeholder : 'paste', mask : 'ctrl+v', type : 'down', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !Sheet.Edit.State){
					Sheet.Edit.Clip();
				}
			}
		}
	];
	Shortkey.Custom = {
		'color0' : {
			placeholder : 'color-1', mask : 'ctrl+1', type : 'down', isPrevented : true, 
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color0');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color0');
				}
			}
		},
		'color1' : {
			placeholder : 'color-2', mask : 'ctrl+2', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color1');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color1');
				}
			}
		},
		'color2' : {
			placeholder : 'color-3', mask : 'ctrl+3', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color2');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color2');
				}
			}
		},
		'color3' : {
			placeholder : 'color-4', mask : 'ctrl+4', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color3');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color3');
				}
			}
		},
		'color4' : {
			placeholder : 'color-5', mask : 'ctrl+5', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color4');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color4');
				}
			}
		},
		'color5' : {
			placeholder : 'color-6', mask : 'ctrl+6', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color5');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color5');
				}
			}
		},
		'color6' : {
			placeholder : 'color-7', mask : 'ctrl+7', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color6');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color6');
				}
			}
		},
		'color7' : {
			placeholder : 'color-8', mask : 'ctrl+8', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color7');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color7');
				}
			}
		},
		'color_clear' : {
			placeholder : 'color-reset', mask : 'ctrl+9', type : 'down', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color_clear');
				} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
					Sheet.Edit.Clip('color_clear');
				}
			}
		},
		'sheet-insert' : {
			placeholder : 'sheet-insert', mask : 'ctrl+shift+a', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				!Sheet.Multiple.State && Sheet.Command.i(Sheet.Current);
				return false;
			}
		},
		'sheet-remove' : {
			placeholder : 'sheet-remove', mask : 'ctrl+shift+d', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				!Sheet.Multiple.State && Sheet.Command.r(Sheet.Current);
				return false;
			}
		},
		'plus' :  {placeholder : 'time-plus', mask : 'ctrl+plus', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('plus');
				} else if (Sheet.Current.target == 'starttime' || Sheet.Current.target == 'endtime'){
					Sheet.Edit.TimePlus();
				}
			}
		},
		'minus' :  {
			placeholder : 'time-minus', mask : 'ctrl+minus', type : 'hold', isPrevented : true,
			handler : function(e){
				e.preventDefault();
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('minus');
				} else if (Sheet.Current.target == 'starttime' || Sheet.Current.target == 'endtime'){
					Sheet.Edit.TimeMinus();
				}
			}
		}, 
		'carve' : {
			placeholder : 'time-carve', mask : 'ctrl+`', type : 'down', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State){
					$('.vjs-selecttime-control').trigger('click');
				}
				return false;
			}
		},
		'sheetJump' : {
			placeholder : 'move-current', mask : 'alt+q', type : 'down', isPrevented : true,
			handler : function(){
				if (!Sheet.Multiple.State && !isNaN(Sheet.Focus)) Sheet.RowOffset(Sheet.Focus);
				return false;
			}
		},
		'videoJump' : {
			placeholder : 'timeline-current', mask : 'ctrl+q', type : 'down', isPrevented : true,
			handler : function(){
				try{
					if (!Sheet.Multiple.State){
						Video.CurrentTime(Sheet.ArrayData[Sheet.Current.row].start / 1000);
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
					if (!Sheet.Multiple.State){
						e.preventDefault();
						Video.Toggle();
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
				Video.CurrentTime(Video.CurrentTime() - 10);
				return false;
			}
		},
		'next' : {
			placeholder : 'video-next', mask : 'ctrl+right', type : 'hold', isPrevented : true,
			handler : function(){
				Video.CurrentTime(Video.CurrentTime() + 10);
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
				Fn.Data('set','customkey-'+key, mask);
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
			keystr = Fn.Data('get','customkey-'+key);
			if(keystr) Shortkey.Custom[key].mask = keystr;
			$.Shortcuts.add(Shortkey.Custom[key]);
		}
		$.Shortcuts.callback(function(e, keycode, regexp){
			keycode = e.keyCode ? e.keyCode : e.which;
			regexp = /[A-Za-o0-9`åÀ½»ÜÛÝºÞ¼¾¿]/;
			if (!Interface.Layer && $('.ui-dialog.on').length == 0 && !Sheet.Edit.State && !Sheet.Multiple.State && (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo') && !e.ctrlKey && !e.altKey && (regexp.test(String.fromCharCode(keycode)) || 0 === keycode || keycode === Shortkey.Code.space)){
				Sheet.Edit.On();
			}
		});
		$.Shortcuts.start();
		Shortkey.Switching();
	});
	Subtitle.Header = {
		smi : ['index','starttime','dur','text','memo'],
		srt : ['index','starttime','endtime','dur','text','memo']
	};
	Subtitle.ToSRT = (function(format, originData, originDataSize, originIndex, originTimeline, convertData, convertIndex, convertLast){
		convertIndex = 0;
		convertData = [];
		if ('srtstring' == format){
			if (originData.indexOf('\r\n\r\n') >= 0) {
				originData = originData.split('\r\n');
			} else if (originData.indexOf('\n\r\n\r') >= 0){
				originData = originData.split('\n\r');
			} else if (originData.indexOf('\n\n') >= 0){
				originData = originData.split('\n');
			} else {
				originData = originData.split('\r');
			}
			originTimeline = {
				text: ''
			};
			originData.forEach(function(line) {
				if(!originTimeline.id){
					originTimeline.id = line;
				} else if(!originTimeline.start) {
					var linesize = line.length;
					line = $.trim(line);
					originTimeline.start = line.substring(0,12);
					originTimeline.end = line.substring(linesize - 12,linesize);
				} else if(line !== ''){
					if (originTimeline.text != ''){
						originTimeline.text += '<br>';
					}  
					originTimeline.text += line;
				} else {
					convertData.push({
						start : Fn.Second(originTimeline.start),
						starttime : originTimeline.start,
						end : Fn.Second(originTimeline.end),
						endtime : originTimeline.end,
						text : originTimeline.text,
						memo : ''
					});
					originTimeline = {
						text: ''
					};
				}
			});
		} else if (format == 'smi'){
			originDataSize = originData.length;
			for (originIndex = 0; originIndex < originDataSize; originIndex++){
				originTimeline = originData[originIndex];
				if (Number(originTimeline.start) >= 0){
					if (convertIndex > 0 && (originTimeline.text == '&nbsp;' || originTimeline.text == '') && convertData[convertIndex - 1].end == 0){
						convertData[convertIndex - 1].end = originTimeline.start;
					} else if (originTimeline.text != '&nbsp;' && originTimeline.text != ''){
						if (convertIndex > 0 && convertData[convertIndex-1].end == 0) convertData[convertIndex-1].end = originTimeline.start;
						convertData.push({
							start : originTimeline.start,
							end : 0,
							text : originTimeline.text,
							memo : (originTimeline.memo ? originTimeline.memo : '')
						});
						convertIndex++;
					}
				}
			}
			convertLast = convertData[convertData.length - 1];
			if (convertLast && convertLast.end == 0) convertLast.end = parseInt(convertLast.start) + 99999;
		} else if ('smistring' == format){
			convertData = Subtitle.ToSMI('smistring', originData);
			return Subtitle.ToSRT('smi', convertData.ArrayData);
		} else if ('string' == format){
			originData = originData.split('\n');
			originData.forEach(function(string,index){
				originTimeline = Subtitle.Vaild(string);
				convertData.push({
					start : 0,
					end : 0,
					text : originTimeline,
					memo : ''
				});
			});
		}
		return {
			Format : 'srt',
			ArrayData : convertData
		}
	});
	Subtitle.ToSMI = (function(format, originData, originDataSize, originIndex, originTimeline, originTimelineStart, originText, convertData, convertIndex){
			var temp = [];
			convertIndex = 0;
			convertData = [];
			if ('smistring' == format){
				$('sami'),$('sync');
				originData = originData.split(/<sync/i);
				for (originIndex in originData){
					originTimeline = $('<sync'+originData[originIndex]+'</p></sync>');
					originText = originTimeline.children('p');
					originTimelineStart = originTimeline.attr('start');
					if (originTimelineStart && originTimelineStart >= 0){
						originText = Subtitle.Encode(originText);
						convertData.push({
							start : Number(originTimelineStart),
							text : originText,
							memo : ''
						});
					}
				}
			} else if ('srt' == format){
				originDataSize = originData.length;
				for (originIndex = 0; originIndex < originDataSize; originIndex++){
					originTimeline = originData[originIndex];
					!originTimeline.memo && (originTimeline.memo = '');
					if (originIndex > 0) temp.prev = originData[originIndex - 1];
					if (temp.prev && temp.prev.end == originTimeline.start){
						convertData[convertIndex - 1].text = originTimeline.text;
						convertData[convertIndex - 1].memo = originTimeline.memo;
					} else {
						convertData.push({
							start : originTimeline.start,
							text : originTimeline.text,
							memo : originTimeline.memo
						});
						convertIndex++;
					}
					convertData.push({
						start : Number(originTimeline.end),
						text : '',
						memo : ''
					});
					convertIndex++;
				}
			} else if ('srtstring' == format){
				convertData = Subtitle.ToSRT('srtstring', originData);
				return Subtitle.ToSMI('srt', convertData.ArrayData);
			} else if ('string' == format){
				originData = originData.split('\n');
				originData.forEach(function(string){
					originText = Subtitle.Vaild(string);
					convertData.push({
						start : 0,
						text : originText,
						memo : ''
					});
				});
			}
			return {
				Format : 'smi',
				ArrayData : convertData
			}
	});
	Subtitle.Encode = (function(input,text,contents){
		input.find('*').each(function(eq,element,color,attr){
			element = $(element);
			if (element.attr('color') || (element.attr('style') && element.attr('style').indexOf('color') == 0)){
				color = eval(element.css('color'));
				element.prop('style',false);
				if (element[0].localName == 'font'){
					element.attr('color',color);
				} else {
					element.removeAttr('color').wrap('<font />');
					element.parent().attr('color',color);
				};
			}
			attr = $.map(this.attributes, function(attr) {
				return attr.name;
			});
			$.each(attr, function(eq, attrItem) {
				try{
					if (attrItem != 'color') element.removeAttr(attrItem);
				} catch(e) {}
			});
		});
		text = input.html().replace(/\n/gi,'').replace(/\t/gi,'');
		contents = Subtitle.Vaild(text);
		if (contents.length >= 4){
			contents = contents.lastIndexOf('<br>') == contents.length - 4 ? contents.substr(0,contents.length - 4) : contents;
		}
		function rgb(a,b,c){
			var r = (a).toString(16), g = (b).toString(16), b = (c).toString(16);
			return  ('#' + (r.length == 1 ? ('0'+ r) : r) + (g.length == 1 ? ('0'+ g) : g) + (b.length == 1 ? ('0'+ b) : b)).toUpperCase();
		};
		return contents;
	});
	Subtitle.Vaild = (function(text){
		return text.replace(/<strong/gi,'<b').replace(/<\/strong/gi,'<\/b')
		.replace(/<script/gi,'&lt;script').replace(/<\/script/gi,'&gt;\/script')
		.replace(/<br \/>/gi,'<br>').replace(/\t/gi,'')
		.replace(/<em/gi,'<i').replace(/<\/em/gi,'<\/i')
		.replace(/<div>/gi,'').replace(/<br><\/div>/gi,'<br>').replace(/<\/div>/gi,'<br>')
		.replace(/<span>/gi,'').replace(/<\/span>/gi,'')
		.replace(/<p>/gi,'').replace(/<br><\/p>/gi,'<br>').replace(/<\/p>/gi,'<br>');
	});
	Subtitle.Import = {
		Btn : $('#subtitle-import').find('.subtitle-load'),
		TEXT : (function(){
			Subtitle.Import.Btn.off('click').on('click',function(data){
				data = $('#subtitle-text').val();
				if (data == ''){
					Interface.Alert(i18n.t('please-input-contents'));
				} else {
					Sheet.Current.row = 0;
					Sheet.Current.col = 0;
					Sheet.Move.Event();
					Sheet.Set(Subtitle['To'+ Sheet.Format.toLocaleUpperCase()]('string',data));
					Interface.Dialog();
					ga("send",{hitType:"event",eventCategory:"Subtitle",eventAction:"Text Import",eventLabel:"Subtitle Import"});
				}
				return false;
			});
		}),
		SMI : (function(smiEncode){
			smiEncode = Fn.Data('get','smiEncode');
			smiEncode == '' && (smiEncode = null);
			Interface.Select.Trigger('smiEncode',smiEncode);
			Subtitle.Import.Btn.off('click').on('click',function(encode,iFile,fileData,fileFormat,fileReader){
				encode		= $('[data-key="smiEncode"]').data('value');
				iFile		= $('#smi-file');
				fileData	= iFile[0].files[0];
				if (fileData){
					fileFormat = fileData.name.split('.').pop();
					fileReader = new FileReader();
					if (fileFormat.search(/smi/i) < 0){
						Interface.Alert(i18n.t('not-support-file-format'));
						iFile.val('').trigger('change');
					} else {
						fileReader.readAsText(fileData,encode);
						fileReader.onload = function(e) {
							Sheet.Current.row = 0;
							Sheet.Current.col = 0;
							Sheet.Move.Event();
							Sheet.Set(Subtitle['To'+ Sheet.Format.toLocaleUpperCase()]('smistring',fileReader.result));
							Interface.Dialog();
							fileReader = null;
						}
					}
					ga("send",{hitType:"event",eventCategory:"Subtitle",eventAction:"SMI Import",eventLabel:"Subtitle Import"});
				} else {
					Interface.Alert(i18n.t('please-select-smi-file'));
				}
				return false;
			});
		}),
		SRT : (function(srtEncode){
			srtEncode = Fn.Data('get','srtEncode');
			srtEncode == '' && (srtEncode = null);
			Interface.Select.Trigger('srtEncode',srtEncode);
			Subtitle.Import.Btn.off('click').on('click',function(encode,iFile,fileData,fileFormat,fileReader){
				encode		= $('[data-key="srtEncode"]').data('value');
				iFile		= $('#srt-file');
				fileData	= iFile[0].files[0];
				if (fileData){
					fileFormat = fileData.name.split('.').pop();
					fileReader = new FileReader();
					if (fileFormat.search(/srt/i) < 0){
						Interface.Alert(i18n.t('not-support-file-format'));
						iFile.val('').trigger('change');
					} else {
						fileReader.readAsText(fileData,encode);
						fileReader.onload = function(e) {
							Sheet.Current.row = 0;
							Sheet.Current.col = 0;
							Sheet.Move.Event();
							Sheet.Set(Subtitle['To'+ Sheet.Format.toLocaleUpperCase()]('srtstring',fileReader.result));
							Interface.Dialog();
							fileReader = null;
						}
					}
					ga("send",{hitType:"event",eventCategory:"Subtitle",eventAction:"SRT Import",eventLabel:"Subtitle Import"});
				} else {
					Interface.Alert(i18n.t('please-select-srt-file'));
				}
				return false;
			});
		}),
	};
	Subtitle.Export = {
		CLASS : {
			'KRCC' : 'Name:Korean; lang:ko-KR; SAMIType:CC;',
			'ENCC' : 'Name:English; lang:en-US; SAMIType:CC;',
			'JPCC' : 'Name:Japanese; lang:en-US; SAMIType:CC;'
		},
		Convert : function(format, data, subtitle, arraySize, arrayIndex, currentTimeline){
			subtitle = [];
			if (!data) data = Clone(Sheet.ArrayData);
			if (Sheet.Format != format){
				data = Subtitle['To'+format.toLocaleUpperCase()](Sheet.Format,data).ArrayData;
			}
			arraySize = data.length;
			if (format && format == 'srt' || Sheet.Format == 'srt') {
				for (arrayIndex = 0; arrayIndex < arraySize; arrayIndex++){
					currentTimeline = Clone(data[arrayIndex]);
					subtitle[arrayIndex] = {
						'start' : currentTimeline.start,
						'starttime' : Fn.Hour(currentTimeline.start),
						'end' : currentTimeline.end,
						'endtime' : Fn.Hour(currentTimeline.end),
						'text' : currentTimeline.text,
						'memo' : currentTimeline.memo
					}
				}
			} else if (Sheet.Format == 'smi') {
				for (arrayIndex = 0; arrayIndex < arraySize; arrayIndex++){
					currentTimeline = Clone(data[arrayIndex]);
					subtitle[arrayIndex] = {
						'start' : currentTimeline.start,
						'starttime' : Fn.Hour(currentTimeline.start),
						'text' : currentTimeline.text,
						'memo' : currentTimeline.memo
					}
				}
			}
			return subtitle;
		},
		SMI : function(form, smiEncode){
			smiEncode = Fn.Data('get','smiEncodeFile');
			(!smiEncode || smiEncode == '') && (smiEncode = 'EUC-KR');
			Interface.Select.Trigger('smiEncodeFile',smiEncode);
			form = $('#subtitle-export-smi');
			form.off('submit').on('submit',function(captionString, smiFileName, smiFileEncode, smiSign){
				captionString = JSON.stringify(Subtitle.Export.Convert('smi'));
				form.find('.lang_key').val(Sheet.Language);
				form.find('.lang_value').val(Subtitle.Export.CLASS[Sheet.Language]);
				form.find('.caption').val(captionString);
			});
		},
		SRT : function(form, srtEncode){
			srtEncode = Fn.Data('get','srtEncodeFile');
			srtEncode == '' && (srtEncode = null);
			Interface.Select.Trigger('srtEncodeFile',srtEncode);
			form = $('#subtitle-export-srt');
			form.off('submit').on('submit',function(captionString, srtFileName, srtFileEncode, srtIsStyle){
				captionString = JSON.stringify(Subtitle.Export.Convert('srt'));
				form.find('.caption').val(captionString);
			});
		},
		VTT : function(form, vttEncode){
			vttEncode = Fn.Data('get','vttEncodeFile');
			vttEncode == '' && (vttEncode = null);
			Interface.Select.Trigger('vttEncodeFile',vttEncode);
			form = $('#subtitle-export-vtt');
			form.off('submit').on('submit',function(captionString, vttFileName, vttFileEncode, vttIsStyle){
				captionString = JSON.stringify(Subtitle.Export.Convert('srt'));
				form.find('.caption').val(captionString);
			});
		},
		JSON : function(form, jsonFormat){
			jsonFormat = Fn.Data('get','jsonFormat');
			jsonFormat == '' && (jsonFormat = null);
			Interface.Select.Trigger('jsonFormat',jsonFormat);
			form = $('#subtitle-export-json');
			form.off('submit').on('submit',function(captionString, jsonFileFormat){
				jsonFileFormat = $('.json-format').val();
				captionString = JSON.stringify(Subtitle.Export.Convert(jsonFileFormat));
				form.find('.caption').val(captionString);
			});
		},
		EXCEL : function(form, excelFormat){
			excelFormat = Fn.Data('get','excelFormat');
			excelFormat == '' && (excelFormat = null);
			Interface.Select.Trigger('excelFormat',excelFormat);
			form = $('#subtitle-export-excel');
			form.off('submit').on('submit',function(captionString, captionStyleFormat){
				captionStyleFormat = $('.excel-format').val();
				captionString = JSON.stringify(Subtitle.Export.Convert(captionStyleFormat));
				form.find('.caption').val(captionString);
			});
		}
	};

	Fn.Data = (function(io, k, v){
		switch (io){
			case 'set'	: localStorage.setItem(k,JSON.stringify(v)),v=true;break;
			case 'del'	: localStorage.removeItem(k),v=true;break;
			case 'get'	: v = JSON.parse(localStorage.getItem(k));break;
		}
		return v;
	});
	Fn.Log = (function() {  
		var Log = {};
		Log.Index = -1;
		Log.ArrayData = [];
		Log.Prev = (function(o){
			o = Log.Index;
			return o >= -1 && (--Log.Index), Log.ArrayData[Log.Index + 1];
		});
		Log.Next = (function(e,o) {
			e = Log.ArrayData,
			o = Log.Index;
			return o < e.length - 1 && (++Log.Index), e[Log.Index];
		});
		Log.Current = (function(e,o) {
			e = Log.ArrayData,
			o = Log.Index;
			return void 0 === e[o] ? [] : e[o]
		});
		Log.Latest = (function(e,o) {
			e = Log.ArrayData,
			o = e.length - 1;
			return Log.Index = o, void 0 === e[o] ? [] : e[o];
		});
		Log.Update = (function(e,z,o,n) {
			z = 0,
			o = Log.ArrayData,
			n = Log.Index;
			return n != o.length - 1 && (o = o.slice(0, n + 1)), o.push(e), 0 !== z && o.length > z && (o = o.slice(o.length - z, o.length)), n = o.length - 1, Log.Index = n, Log.ArrayData = o, !1//Clone(o), !1
		});
		Log.Clear = (function(){
			Log.Index = -1, Log.ArrayData= [];
		})
		return Log;
	})();
	Fn.Hour = (function(msec){
		msec=(msec/1000).toFixed(3).toString().split('.');
		msec[0]=parseInt(msec[0]);
		msec[1]||(msec[1]=0);
		return Math.floor(msec[0]/3600).zf(2)+':'+Math.floor(msec[0]%3600/60).zf(2)+':'+Math.floor(msec[0]%60).zf(2)+','+msec[1].zf(3);
	});
	Fn.Second = (function(hour){
		try{
			hour = hour.split(':');
			hour[0] = parseInt(hour[0]);
			hour[1] = parseInt(hour[1]);
			hour[2] = parseInt(hour[2].replace(',',''));
			return (hour[0] * 3600000) + (hour[1] * 60000) + hour[2];
		} catch (e) {
		}
	});
	Fn.Format = (function(format,optionArray){
		if (format != Sheet.Format){
			Interface.Confirm({
				title:i18n.t('subtitle-format-change'),
				content :i18n.t('subtitle-format-change-contents'),
				bgDismiss:true,
				success:function(){
					Fn.Data('set','format',format);
					optionArray = {};
					if (Sheet.Format != format){
						optionArray = Subtitle['To'+ format.toUpperCase()](Sheet.Format, Sheet.ArrayData);
						optionArray.Header = Subtitle.Header[format];
					}
					Sheet.Set(optionArray);
					Sheet.Current.row = 0;
					Sheet.Current.col = 0;
					Sheet.Move.Event();
					Fn.Log.Clear();
					Sheet.Edit.History();
				},
				cancel:function(){
					Interface.Select.Trigger('format',Sheet.Format);
				}
			});
		}
	});
	Fn.Language = (function(language){
		i18n.setLanguage(language);
		Fn.Data('set','language',language);
		Sheet.Set({
			Language : language,
			Header : Subtitle.Header[Sheet.Format]
		});
		Interface.I18n();
		$('.nav-open').removeClass('nav-open');
	});
	Fn.EncodeSmi = (function(encodeType){
		Fn.Data('set','smiEncode',encodeType);
	});
	Fn.EncodeSrt = (function(encodeType){
		Fn.Data('set','srtEncode',encodeType);
	});
	Fn.EncodeSmiFile = (function(encodeType){
		Fn.Data('set','smiEncodeFile',encodeType);
		$('.encode_smi_file').val(encodeType);
	});
	Fn.EncodeSrtFile = (function(encodeType){
		Fn.Data('set','srtEncodeFile',encodeType);
		$('.encode_srt_file').val(encodeType);
	});
	Fn.EncodeVttFile = (function(encodeType){
		Fn.Data('set','vttEncodeFile',encodeType);
		$('.encode_vtt_file').val(encodeType);
	});
	Fn.ExcelFormat = (function(encodeType){
		Fn.Data('set','excelFormat',encodeType);
		$('.excel-format').val(encodeType);
	});
	Fn.JsonFormat = (function(encodeType){
		Fn.Data('set','jsonFormat',encodeType);
		$('.json-format').val(encodeType);
	});
	//Sheet trigger
	SheetTrigger.Init = function(){
		SheetTrigger.Wrap	= Sheet.Interface.find('.sheet-trigger');
		SheetTrigger.Input	= SheetTrigger.Wrap.children('.sheet-input');
		SheetTrigger.Input.on({
			'keydown' : function(){
				if (Sheet.Current.target != 'text' && Sheet.Current.target != 'memo') this.innerHTML = '';
			},
			'click' : function(){
				$(this).focus();
				return false;
			}
		});
	};
	SheetTrigger.AutoFocus = function(){
		clearTimeout(Sheet.AutoFocusTimer);
		Sheet.AutoFocusTimer = setTimeout(function() {
			SheetTrigger.Wrap.trigger('focus');
			Sheet.Active.target.indexOf('time') == -1 && SheetTrigger.Input.trigger('focus');
		});
	};
	SheetTrigger.Focus = (function(col,height,bottom){
		if (col && col.length > 0){
			Sheet.Offset = col.position().top - 1;
		} else {
			Sheet.Offset = (function(arrayInfo,currentIndex,index,offset){
				arrayInfo[currentIndex].height;
				for(offset=index=0;index<currentIndex;index++)
					offset+=arrayInfo[index].height;
				return offset - 1;
			})(Sheet.ArrayInfo,Sheet.Current.row);
		}
		height = Sheet.ArrayInfo[Sheet.Current.row].height;
		bottom = Sheet.Offset + height;
		if (Sheet.Scroll > Sheet.Offset){
			Sheet.Init = true;
			Sheet.Scroll = Sheet.Offset + 1;
			Sheet.Body.scrollTop(Sheet.Offset);
		} else if ((Sheet.Scroll + Sheet.Canvas.Height) < bottom) {
			bottom = bottom - Sheet.Canvas.Height + 1;
			Sheet.Init = true;
			Sheet.Scroll = bottom;
			Sheet.Body.scrollTop(bottom);
		}
		SheetTrigger.Wrap.css({
			'left'		: Sheet.Move.Left[Sheet.Format][Sheet.Current.col],
			'top'		: Sheet.Offset
		});
		SheetTrigger.Input.html(Sheet.Current.data[Sheet.Current.target] + '<br>').css({
			'min-width'	: Sheet.ColWidth[Sheet.Current.target](),
			'min-height': height + 1
		});
		SheetTrigger.AutoFocus();
		if (!Sheet.Multiple.State){
			switch (Sheet.Current.target){
				case 'starttime': 
					$('.btn-text-controls').addClass('disabled');
					$('.btn-time-controls').removeClass('disabled');
					break;
				case 'endtime': 
					$('.btn-text-controls').addClass('disabled');
					$('.btn-time-controls').removeClass('disabled');
					break;
				case 'text': 
					$('.btn-text-controls').removeClass('disabled');
					$('.btn-time-controls').addClass('disabled');
					break;
				case 'memo': 
					$('.btn-text-controls').removeClass('disabled');
					$('.btn-time-controls').addClass('disabled');
					break;
			}
		}
	});

	//Sheet
	Sheet.Language			= 'KRCC';
	Sheet.Height			= 0;
	Sheet.CellPadding		= 7;
	Sheet.LineHeight		= 22;
	Sheet.ArrayData			= [];
	Sheet.ArrayInfo			= [];
	Sheet.ArrayHeight		= [];
	Sheet.ArrayError		= [];
	Sheet.ArrayMultiple		= [];
	Sheet.Canvas			= {};
	Sheet.Current			= {};
	Sheet.Active			= null;
	Sheet.Empty				= {start : 0, end : 0, text : '', memo : ''};

	/*
	Sheet.ArrayData		= sheetdata;
	Sheet.ArrayData		= [Sheet.Empty];
	*/
	Sheet.Config = {
		Jump : 30,
		InputJump : $('#jump_time_config_value'),
		SetJump : function(jump){
			jump = Fn.Data('get','jump_val');
			jump && (Sheet.Config.Jump = parseInt(jump));
			$('#time-plus').find('strong').text(Sheet.Config.Jump);
			$('#time-minus').find('strong').text(Sheet.Config.Jump);
			Sheet.Config.InputJump.val(Sheet.Config.Jump);
		},
		Init : function(){
			Sheet.Config.SetJump();
			$('#jump_time_change').off().on('click',function(me){
				me = $(this);
				if (!me.hasClass('on')){
					me.addClass('on');
					me.children().text(i18n.t('save'));
					Sheet.Config.InputJump.prop({
						'disabled':false,
						'readonly':false
					}).trigger('focus');
					Sheet.Edit.Cmd('selectAll');
					return false;
				}
			});
			$('.subtitle-move-time').off('submit').on('submit', function(jump,btn){
				jump = $.trim(Sheet.Config.InputJump.val());
				btn = $('#jump_time_change');
				if (jump == ''){
					Interface.Alert(i18n.t('please-input-move-time'));
				} else if (jump <= 0 || jump > 1000){
					Interface.Alert(i18n.t('input-move-time-error'));
				} else {
					btn.removeClass('on');
					btn.children().text(i18n.t('change'));
					Fn.Data('set','jump_val',jump);
					Interface.Success(i18n.t('config-saved'));
					Sheet.Config.SetJump();
					Sheet.Config.InputJump.prop({
						'disabled':true,
						'readonly':true
					});
				}
				return false;
			});
		}
	};
	Sheet.Search = {
		Panel : false,
		Init : function(searchInput){
			Sheet.Search.Form = $('#sheet-search-panel');
			searchInput = Sheet.Search.Form.find('.i-sheet-search');
			$('#sheet-search').on('click',function(){
				Sheet.Search.Panel = !Sheet.Search.Panel;
				searchInput.val('');
				Sheet.Search.Loop('');
				Sheet.Init = true;
				Sheet.Draw();
				setTimeout(function(){
					Sheet.Search.Panel && searchInput.focus();
				});
			});
			searchInput.on({
				'focusin' :function(){
					Sheet.Search.State = true;
				},
				'focusout': function(){
					Sheet.Search.State = null;
				}
			});
			Sheet.Search.Form.find('.btn-prev').on('click',function(){
				if (!$(this).hasClass('disabled')){
					if (Sheet.Search.Current > 0){
						--Sheet.Search.Current;
						Sheet.Search.Move();
					};
				}
				return false;
			});
			Sheet.Search.Form.find('.btn-next').on('click',function(){
				if (!$(this).hasClass('disabled')){
					if (Sheet.Search.Current < Sheet.ArraySearch.length - 1){
						++Sheet.Search.Current;
						Sheet.Search.Move();
					};
				}
				return false;
			});
			Sheet.Search.Form.find('#error-search').on('change',function(errorSearch,errorSize,errorForIndex){
				errorSearch = $(this).is(':checked');
				if (errorSearch){
					searchInput.val('');
					Sheet.ArraySearch = [];
					errorSize = Sheet.ArrayError.length;
					Sheet.ArrayError.sort(function(a,b){return a - b});
					for (errorForIndex = 0; errorForIndex < errorSize; errorForIndex++){
						Sheet.ArraySearch[errorForIndex] = {row : Sheet.ArrayError[errorForIndex], col : 0};
					}
					Sheet.Search.Current = 0;
					Sheet.Search.Move();
					Sheet.Init = true;
					Sheet.Draw();
					$('.form-sheet-search').find('input').prop('disabled',true);
					$('.form-sheet-search').find('button').prop('disabled',true);
				} else {
					Sheet.ArraySearch = [];
					Sheet.Search.Loop('');
					$('.form-sheet-search').find('input').prop('disabled',false);
					$('.form-sheet-search').find('button').prop('disabled',false);
				}
			});
			$('.form-sheet-search').on('submit',function(data){
				data = searchInput.val();
				Sheet.Search.Loop(data.toLowerCase());
				return false;
			});
		},
		Loop : function(data,arrayDataSize,arrayDataForIndex,arrayDataTimeline,textIndex,memoIndex,resultStart){
			Sheet.ArraySearch = [];
			if (data && data != ''){
				arrayDataSize = Sheet.ArrayData.length;
				textIndex = Sheet.Format == 'smi' ? 1 : 2;
				memoIndex = Sheet.Format == 'smi' ? 2 : 3;
				for (arrayDataForIndex = 0;arrayDataForIndex < arrayDataSize;arrayDataForIndex++){
					arrayDataTimeline = Sheet.ArrayData[arrayDataForIndex];
					arrayDataTimeline.text.toLowerCase().search(data) > -1 && Sheet.ArraySearch.push({row : arrayDataForIndex, col : textIndex});
					arrayDataTimeline.memo.toLowerCase().search(data) > -1 && Sheet.ArraySearch.push({row : arrayDataForIndex, col : memoIndex});
				}
			}
			Sheet.Search.Current = 0;
			Sheet.Search.Move();
			Sheet.Init = true;
			Sheet.Draw();
		},
		Move : function(searchSize){
			searchSize = Sheet.ArraySearch.length;
			if (searchSize > 0){
				Sheet.Current = Clone(Sheet.ArraySearch[Sheet.Search.Current]);
				Sheet.Move.Event();
			} else {
				Sheet.Search.Current = -1;
			}
			$('#sheet-search-panel').find('.result').text((Sheet.Search.Current + 1) + '/' + searchSize);
			Sheet.Search.Form.children('a').removeClass('disabled');
			if (Sheet.Search.Current <= 0) Sheet.Search.Form.children('.btn-prev').addClass('disabled');
			if (Sheet.Search.Current >= searchSize - 1) Sheet.Search.Form.children('.btn-next').addClass('disabled');
		},
		Error : function(arrayData,errorSize){
			errorSize = Sheet.ArrayError.length;
			if (errorSize){
				$('.error-count').text(errorSize);
				$('.error-label').show();
			} else {
				$('.error-label').hide();
			}
		}
	}
	Sheet.Multiple = {
		State : false,
		Toggle : function(){
			if (!Sheet.Multiple.State){
				Sheet.ArrayMultiple = [];
				Sheet.Multiple.State = true;
				Sheet.Multiple.Start = Sheet.Current.row;
				Sheet.Multiple.Checking(Sheet.Current.row);
				$('#sheet-multiple').addClass('on');
				$('.btn-single-controls').addClass('disabled');
				$('.btn-multiple-controls').removeClass('disabled');
			} else {
				Sheet.ArrayMultiple = [];
				Sheet.Multiple.State = false;
				Sheet.Multiple.Start = null;
				Sheet.Panel.find('.multiple').removeClass('multiple');
				$('#sheet-multiple').removeClass('on');
				$('.btn-single-controls').removeClass('disabled');
				switch (Sheet.Current.target){
					case 'starttime': 
						$('.btn-text-controls').addClass('disabled');
						$('.btn-time-controls').removeClass('disabled');
						break;
					case 'endtime': 
						$('.btn-text-controls').addClass('disabled');
						$('.btn-time-controls').removeClass('disabled');
						break;
					case 'text': 
						$('.btn-text-controls').removeClass('disabled');
						$('.btn-time-controls').addClass('disabled');
						break;
					case 'memo': 
						$('.btn-text-controls').removeClass('disabled');
						$('.btn-time-controls').addClass('disabled');
						break;
				}
				Sheet.Edit.History();
			}
		},
		Checking : (function(row,currentIndex,selectionIndex,selectionStart,selectionEnd){
			if (!Sheet.Shift){
				Sheet.Multiple.Start = row;
				currentIndex = Sheet.ArrayMultiple.indexOf(row);
				if (currentIndex == -1){
					Sheet.Panel.find('.row-'+row).addClass('multiple');
					Sheet.ArrayMultiple.push(row);
				} else {
					Sheet.Panel.find('.row-'+row).removeClass('multiple');
					Sheet.ArrayMultiple.splice(currentIndex,1);
				}
			} else {
				selectionStart		= Sheet.Multiple.Start <= row ? Sheet.Multiple.Start : row;
				selectionEnd		= Sheet.Multiple.Start <= row ? row : Sheet.Multiple.Start;
				for (selectionIndex = selectionStart; selectionIndex <= selectionEnd; selectionIndex++){
					currentIndex = Sheet.ArrayMultiple.indexOf(selectionIndex);
					if (currentIndex == -1){
						Sheet.ArrayMultiple.push(selectionIndex);
						Sheet.Panel.find('.row-'+selectionIndex).addClass('multiple');
					}
				}
			}
		}),
		Update : (function(arrayData,position,arrayDataSize,arrayDataForIndex,arrayDataTimeline){
			arrayDataSize = arrayData.length;
			Extend(Sheet.Current,position);
			for (arrayDataForIndex = 0; arrayDataForIndex < arrayDataSize; arrayDataForIndex++){
				arrayDataTimeline = arrayData[arrayDataForIndex];
				Sheet.ArrayData[arrayDataTimeline.index] = arrayDataTimeline.data;
			}
			Sheet.Convert();
			Sheet.Init = true;
			Sheet.Draw();
			Sheet.Move.Event();
		})
	};
	Sheet.RowOffset = (function(currentIndex){
		Sheet.Offset = (function(arrayInfo,currentIndex,index,offset){
			arrayInfo[currentIndex].height;
			for (offset=index=0;index<currentIndex;index++)
				offset+=arrayInfo[index].height;
			return offset - 1;
		})(Sheet.ArrayInfo,currentIndex);
		Sheet.Body.scrollTop(Sheet.Offset);
		Sheet.Current.row = currentIndex;
		Sheet.Move.Event();
	});
	Sheet.TimeSearch = function(sec,result,arrayData,currentTimeline){
		result = {};
		arrayData = Sheet.ArrayData;
		result.index = arrayData.findIndex(function(row,eq,data){
			if (!row.end) row.end = data[eq + 1] ? data[eq + 1].start : 999999
			return row.start<=sec && row.end>sec;
		});
		result.visible = true;
		if (result.index == -1){
			result.index = arrayData.findIndex(function(row){return row.start>sec;});
			result.visible = false;
		}
		result.timeline = Clone(arrayData[result.index]);
		currentTimeline = Sheet.ArrayInfo[result.index];
		currentTimeline && currentTimeline.starttime && (result.timeline.starttime = currentTimeline.starttime);
		return result;
	};
	Sheet.Undo = (function(undo,prev){
		undo = $('#undo');
		prev = Fn.Log.Prev();
		if (prev && !undo.hasClass('disabled')){
			if (prev.cmd.indexOf('m.') == 0){
				Sheet.Multiple.Update(prev.o,prev.current);
			} else {
				if ('i' === prev.cmd){
					prev.current.row = prev.id;
					Sheet.Remove(prev.current);
				} else if ('r' === prev.cmd){
					Sheet.Current.col = prev.current.col;
					Sheet.Insert({ index : prev.id, data : prev.o });
				} else if ('u' === prev.cmd && JSON.stringify(Sheet.ArrayData[prev.id]) === JSON.stringify(prev.n)){
					Sheet.Update(prev.current, prev.o);
				}
			}
		} else {
			Fn.Log.Next();
		}
		Sheet.Edit.History();
		return false;
	});
	Sheet.Redo = (function(redo,next){
		redo = $('#redo');
		next = Fn.Log.Next();
		if (next && !redo.hasClass('disabled')){
			if (next.cmd.indexOf('m.') == 0){
				Sheet.Multiple.Update(next.n,next.current);
			} else {
				if ('i' === next.cmd){
					Sheet.Current.col = next.current.col;
					Sheet.Insert({index : next.id, data : next.n});
				} else if ('r' === next.cmd){
					Sheet.Remove(next.current);
				} else if ('u' === next.cmd){
					Sheet.Update(next.current, next.n);
				}
			}
		}
		Sheet.Edit.History();
		return false;
	});
	Sheet.AutoSave = function(){
		clearTimeout(Sheet.AutoSaveTimer);
		Sheet.AutoSaveTimer = setTimeout(function() {
			Fn.Data('set','SUBTITLE_TEMP', Sheet.ArrayData);
		},400);
	};
	Sheet.UpdateTarget = {
		smi : {
			starttime : (function(position,timeline,row,prev,next,error){
				row = Sheet.Panel.find('.row-' + position.row);
				prev = Sheet.ArrayData[position.row - 1];
				next = Sheet.ArrayData[position.row + 1];
				error = Sheet.ArrayError.indexOf(position.row);
				if (next && Number(timeline.start) > Number(next.start)){
					error == -1 && (Sheet.ArrayError.push(position.row));
					row.addClass('error');
				} else {
					error != -1 && (Sheet.ArrayError.splice(error, 1));
					row.removeClass('error');
				}
				if (prev){
					prev.end = timeline.start;
					row.prev().find('.dur').children().text(((prev.end - prev.start) / 1000).toFixed(3));
					error = Sheet.ArrayError.indexOf(position.row - 1);
					if (prev.start > timeline.start){
						if (error == -1) Sheet.ArrayError.push(position.row - 1);
						row.prev().addClass('error');
					} else {
						if(error != -1) Sheet.ArrayError.splice(error, 1);
						row.prev().removeClass('error');
					}
				}
				Sheet.ArrayInfo[position.row].starttime = Fn.Hour(timeline.start);
				next && (timeline.end = next.start, row.find('.dur').children().text(((next.start - timeline.start) / 1000).toFixed(3)));
				row.find('.starttime').children().text(Sheet.ArrayInfo[position.row].starttime);
				Sheet.Search.Error(Sheet.ArrayError);
			}),
			text : (function(position,timeline,row,originLine,newLine,durLine,durHeight){
				row			= Sheet.Panel.find('.row-' + position.row);
				row.children('.col-'+position.col).find('.cell').html(timeline.text + '<br />');
				originLine	= Sheet.ArrayInfo[position.row].line;
				newLine		= timeline[Sheet.Current.target].split('<br').length;
				if (originLine != newLine){
					durLine = newLine - originLine;
					durHeight = durLine * Sheet.LineHeight;
					Sheet.ArrayInfo[position.row].line = newLine;
					Sheet.ArrayInfo[position.row].height += durHeight;
					Sheet.ArrayHeight[position.row] += durHeight;
					Sheet.Interface.find('.sheet-body').scrollbar();
					Sheet.Height += durHeight;
					Sheet.Contain.height(Sheet.Height);
					row.find('.memo > .cell').css({
						'-webkit-line-clamp':newLine,
						'max-height':Sheet.ArrayHeight[position.row] +'px'
					});
				}
				SheetTrigger.Focus(row.children('.col-'+position.col));
			}),
			memo : (function(position,timeline,col){
				col = Sheet.Panel.find('.row-' + position.row).children('.col-'+position.col);
				col.find('.cell').html(timeline.memo + '<br />');
				SheetTrigger.Focus(col);
			})
		},
		srt : {
			time : (function(position,timeline,row,prev,next,error,value){
				row = Sheet.Panel.find('.row-' + position.row);
				prev = Sheet.ArrayData[position.row - 1];
				next = Sheet.ArrayData[position.row + 1];
				error = Sheet.ArrayError.indexOf(position.row);

				if (next && Number(timeline.end) > Number(next.start)){
					error == -1 && (Sheet.ArrayError.push(position.row));
					row.addClass('error');
				} else if (Number(timeline.start) > Number(timeline.end)) {
					error == -1 && (Sheet.ArrayError.push(position.row));
					row.addClass('error');
				} else {
					error != -1 && (Sheet.ArrayError.splice(error, 1));
					row.removeClass('error');
				}
				if (prev){
					error = Sheet.ArrayError.indexOf(position.row - 1);
					if (Number(prev.end) > Number(timeline.start)){
						error == -1 && (Sheet.ArrayError.push(position.row - 1));
						row.prev().addClass('error');
					} else {
						error != -1 && (Sheet.ArrayError.splice(error, 1));
						row.prev().removeClass('error');
					}
				}
				Sheet.ArrayInfo[position.row].starttime = Fn.Hour(timeline.start);
				Sheet.ArrayInfo[position.row].endtime = Fn.Hour(timeline.end);

				row.find('.starttime').children().text(Sheet.ArrayInfo[position.row].starttime);
				row.find('.endtime').children().text(Sheet.ArrayInfo[position.row].endtime);
				row.find('.dur').children().text(((timeline.end - timeline.start) / 1000).toFixed(3));
				Sheet.Search.Error(Sheet.ArrayError);
			})
		}
	};
	Sheet.UpdateTarget.srt.starttime = Sheet.UpdateTarget.srt.time,
	Sheet.UpdateTarget.srt.endtime = Sheet.UpdateTarget.srt.time;
	Sheet.UpdateTarget.srt.text = Sheet.UpdateTarget.smi.text;
	Sheet.UpdateTarget.srt.memo = Sheet.UpdateTarget.smi.memo;
	Sheet.Update = (function(position, timeline, backup){
		Sheet.Edit.State && Sheet.Edit.Off();
		Extend(Sheet.Current,position);
		Sheet.Current.target = Sheet.Move.Target[Sheet.Format][Sheet.Current.col];
		backup = Clone(Sheet.ArrayData[position.row]);
		Sheet.ArrayData[position.row] = timeline;
		Sheet.UpdateTarget[Sheet.Format][Sheet.Current.target](position, timeline);
		Sheet.AutoSave();
		Sheet.Move.Event();
		return backup;
	});
	Sheet.Insert = function(timeline,timelineInfo,prevIndex,prevTimeline,nextIndex,nextTimeline,errorSize,eq,error){
		Sheet.Edit.State && Sheet.Edit.Off();
		isNaN(timeline.index) && (timeline.index = Sheet.ArrayData.length);
		prevIndex = timeline.index - 1;
		nextIndex = timeline.index;
		if (nextIndex < Sheet.DataSize){
			console.log(1)
			nextTimeline = Sheet.ArrayData[nextIndex];
			if (Sheet.Format == 'srt' && Number(timeline.data.start) == 0) timeline.data.start = nextTimeline.end;
			if (Sheet.Format == 'srt' && Number(timeline.data.end) == 0) timeline.data.end = nextTimeline.end;
			if (Sheet.Format == 'smi' && Number(timeline.data.start) == 0) timeline.data.start = nextTimeline.start;
		} else {
			console.log(2)
			if (prevIndex > -1){
				console.log(3)
				prevTimeline = Sheet.ArrayData[prevIndex];
				if (Sheet.Format == 'srt' && Number(timeline.data.start) == 0) timeline.data.start = prevTimeline.end;
				if (Sheet.Format == 'srt' && Number(timeline.data.end) == 0) timeline.data.end = prevTimeline.end;
				if (Sheet.Format == 'smi' && Number(timeline.data.start) == 0) timeline.data.start = prevTimeline.start;
			}
		}
		Sheet.ArrayData.splice(timeline.index, 0, timeline.data);
		Sheet.DataSize			= Sheet.ArrayData.length - 1;
		Sheet.Current.row		= timeline.index;
		timelineInfo			= {};
		timelineInfo.line		= timeline.data.text.split('<br').length,
		timelineInfo.height		= timelineInfo.line*Sheet.LineHeight+Sheet.CellPadding,
		timelineInfo.starttime	= Fn.Hour(timeline.data.start),
		Sheet.Height += timelineInfo.height,
		"srt"==Sheet.Format&&(timelineInfo.endtime=Fn.Hour(timeline.data.end)),
		Sheet.ArrayHeight.splice(timeline.index, 0, timelineInfo.height),
		Sheet.ArrayInfo.splice(timeline.index, 0, timelineInfo);
		errorSize = Sheet.ArrayError.length;
		for (eq = 0; eq < errorSize; eq++){
			if (Sheet.ArrayError[eq] >= timeline.index) ++Sheet.ArrayError[eq];
		}
		for (prevIndex -= 1; prevIndex < timeline.index + 2;prevIndex++){
			if (prevIndex >= 0 && prevIndex < Sheet.DataSize){
				error = Sheet.ArrayError.indexOf(prevIndex);
				error > -1 && Sheet.ArrayError.splice(error, 1);
				prevTimeline = Sheet.ArrayData[prevIndex];
				nextTimeline = Sheet.ArrayData[prevIndex + 1];
				if (Sheet.Format == 'srt'){
					if (Number(prevTimeline.start) > Number(prevTimeline.end)){
						Sheet.ArrayError.push(prevIndex);
					} else if (Number(prevTimeline.end) > Number(nextTimeline.start)){
						Sheet.ArrayError.push(prevIndex);
					}
				} else if (Sheet.Format == 'smi'){
					if (Number(prevTimeline.start) > Number(nextTimeline.start)){
						Sheet.ArrayError.push(prevIndex);
					}
				}
			}
		}
		Sheet.Contain.height(Sheet.Height);
		Sheet.Init = true;
		Sheet.Draw();
		Sheet.Move.Event();
		Sheet.AutoSave();
		Sheet.Search.Error(Sheet.ArrayError);
		return timeline;
	};
	Sheet.Remove = function(position,backup,eq,arrayErrorSize,error,currentIndex,prevIndex){
		Sheet.Edit.State && Sheet.Edit.Off();
		Sheet.Height -= Sheet.ArrayHeight[position.row];
		Sheet.Current.row	= position.row;
		Sheet.Current.col	= position.col;
		backup				= Clone(Sheet.ArrayData[position.row]);
		Sheet.ArrayHeight.splice(position.row,1);
		Sheet.ArrayInfo.splice(position.row,1);
		Sheet.ArrayData.splice(position.row,1);
		Sheet.DataSize		= Sheet.ArrayData.length - 1;
		currentIndex = position.row-1;

		error = Sheet.ArrayError.indexOf(currentIndex);
		error > -1 && Sheet.ArrayError.splice(error, 1);
		arrayErrorSize = Sheet.ArrayError.length;
		for (eq = 0; eq < arrayErrorSize; eq++){
			if (Sheet.ArrayError[eq] > currentIndex) --Sheet.ArrayError[eq];
		}
		for (prevIndex = currentIndex - 1; prevIndex < currentIndex + 2;prevIndex++){
			if (prevIndex >= 0 && prevIndex < Sheet.DataSize){
				error = Sheet.ArrayError.indexOf(prevIndex);
				error > -1 && Sheet.ArrayError.splice(error, 1);
				if (Sheet.Format == 'srt'){
					if (Number(Sheet.ArrayData[prevIndex].start) > Number(Sheet.ArrayData[prevIndex].end)){
						Sheet.ArrayError.push(prevIndex);
					} else if (Number(Sheet.ArrayData[prevIndex].end) > Number(Sheet.ArrayData[prevIndex + 1].start)){
						Sheet.ArrayError.push(prevIndex);
					}
				} else if (Sheet.Format == 'smi'){
					if (Number(Sheet.ArrayData[prevIndex].start) > Number(Sheet.ArrayData[prevIndex + 1].start)){
						Sheet.ArrayError.push(prevIndex);
					}
				}
			}
		}
		Sheet.Current.row < 0 && (Sheet.Current.row = 0);
		Sheet.Current.row > Sheet.DataSize && (Sheet.Current.row = Sheet.DataSize);
		Sheet.Contain.height(Sheet.Height);
		Sheet.Init = true;
		Sheet.Draw();
		Sheet.Move.Event();
		Sheet.AutoSave();
		Sheet.Search.Error(Sheet.ArrayError);
		return backup;
	};
	Sheet.Command = {
		i : (function(current,insert){
			Sheet.Search.Panel && $('#sheet-search').trigger('click');
			insert = [];
			!current && (current = {row : Sheet.Current.row, col : Sheet.Current.col});
			insert.index = current.row + 1, current.col && (Sheet.Current.col = current.col);
			insert.data = Clone(Sheet.Empty);
			Sheet.Edit.Log('i',insert.index,insert.data,null,current);
			ga("send",{hitType:"event",eventCategory:"Sheet",eventAction:"insert",eventLabel:"Sheet Edit"});
			Sheet.Insert(insert);
		}),
		r : function(current,backup){
			Sheet.Search.Panel && $('#sheet-search').trigger('click');
			if (Sheet.DataSize == 0){
				Sheet.Command.u(current,Clone(Sheet.Empty));
				ga("send",{hitType:"event",eventCategory:"Sheet",eventAction:"empty",eventLabel:"Sheet Edit"});
			} else {
				backup = Sheet.Remove(current);
				Sheet.Edit.Log('r',current.row,null,backup,current);
				ga("send",{hitType:"event",eventCategory:"Sheet",eventAction:"remove",eventLabel:"Sheet Edit"});
			}
		},
		u : (function(position,data,backup,prev){
			Sheet.Search.Panel && $('#sheet-search').trigger('click');
			Sheet.Current.data = data;
			backup = Sheet.Update(position,data);
			Sheet.Edit.Log('u',position.row,data,backup,{row:position.row, col:position.col});
			ga("send",{hitType:"event",eventCategory:"Sheet",eventAction:"update",eventLabel:"Sheet Edit"});
		}),
		m : function(cmd,arrayCurrent,arrayBackup){
			Sheet.Search.Panel && $('#sheet-search').trigger('click');
			Sheet.Edit.Log('m.'+cmd,null,arrayCurrent,arrayBackup,{row:Sheet.Current.row, col:Sheet.Current.col});
			ga("send",{hitType:"event",eventCategory:"Sheet",eventAction:"update",eventLabel:"Sheet Edit"});
		}
	};
	Sheet.Edit = {
		State : false,
		TimeControl : (function(timeEditor,timeParts,timeSliders,milliSecond,timePositive,timeReset){
			timeEditor		= $("#time-editor");
			timeParts		= timeEditor.find('.time-part');
			timeSliders		= timeEditor.find('.time-slider');
			milliSecond		= timeEditor.find('#millisecond');
			timePositive	= timeEditor.find('.time-positive'),
			timeReset		= timeEditor.find('.btn-reset');
			timeSliders.find('.slider').each(function(eq,timeSlider,sliderOption){
				timeSlider		= $(timeSlider);
				sliderOption	=  timeSlider.data();
				timeSlider.slider({
					min: sliderOption.min,
					max: sliderOption.max,
					step : sliderOption.step,
					range: "min",
					slide: function(event, ui) {
						timeParts.find('.'+sliderOption.target).children('input').val(ui.value).trigger('change');
					}
				});
			});
			timePositive.find('input').on('click',function(){
				milli = Number(timeParts.find('.milli > input').val());
				milli += Number(timeParts.find('.second > input').val()) * 1000;
				milli += Number(timeParts.find('.minute > input').val()) * 60 * 1000;
				milli += Number(timeParts.find('.hour > input').val()) * 60 * 60 * 1000;
				milli = Math.abs(milli);
				$(this).val() == 'minus' && (milli *= -1);
				milliSecond.val(milli);
			});
			timeParts.find('.visible').on('click', function(target){
				$(this).parent().find('input').trigger('focus');
				
			});
			timeParts.find('input').on('change keydown keyup',function(time,timeOption,value,milli){
				time		= $(this);
				timeOption	= time.data();
				value = parseInt(time.val());
				isNaN(value) && (value = 0);
				value > timeOption.max && (value = timeOption.max, time.val(value));
				
				timeSliders.find('.'+timeOption.target).slider('option','value',value);
				time.next().text(value.zf(timeOption.zf));

				milli = Number(timeParts.find('.milli > input').val());
				milli += Number(timeParts.find('.second > input').val()) * 1000;
				milli += Number(timeParts.find('.minute > input').val()) * 60 * 1000;
				milli += Number(timeParts.find('.hour > input').val()) * 60 * 60 * 1000;
				milli = Math.abs(milli);
				timePositive.find('[name="time-positive"]:checked').val() == 'minus' && (milli *= -1);
				milliSecond.val(milli);
			});
			milliSecond.on('change', function(time,timeOption,value,hour,minute,second,milli){
				time		= $(this);
				timeOption	= time.data();
				value		= time.val();
				isNaN(value) && (value = 0);
				if (value < 0){
					timePositive.find('.minus').prop('checked',true);
				} else {
					timePositive.find('.plus').prop('checked',true);
				}
				value > timeOption.max && (value = timeOption.max, time.val(value));
				value < timeOption.min && (value = timeOption.min, time.val(value));
				value = Math.abs(value);
				value = (value/1000).toFixed(3).toString().split('.');
				value[0]=parseInt(value[0]);
				value[1]||(value[1]=0);
				hour =  Math.floor(value[0]/3600).zf(2);
				minute = Math.floor(value[0]%3600/60).zf(2);
				second = Math.floor(value[0]%60).zf(2);
				milli = value[1].zf(3);

				timeParts.find('.hour > input').val(hour).trigger('change');
				timeParts.find('.minute > input').val(minute).trigger('change');
				timeParts.find('.second > input').val(second).trigger('change');
				timeParts.find('.milli > input').val(milli).trigger('change');
			});
			timeReset.on('click',function(){
				timeParts.find('input').each(function(eq,timePart){
					$(timePart).val(0).trigger('change');
				});
			});
			timeEditor.find('.time-apply').off('click').on('click',function(positive,milli){
				positive = timePositive.find('[name="time-positive"]:checked').val();
				milli = Math.abs(milliSecond.val());
				if (milli){
					if (!Sheet.Multiple.State){
						Sheet.Edit['Time'+Capitalize(positive)](milli);
					} else {
						Sheet.Edit.MultiClip(positive,milli);
					}
				}
				timeReset.trigger('click');
				Interface.Layout.find('.overlay').trigger('click');
				return false;
			});
		}),
		MultiClip : (function(cmd,jump,arrayBackup,arrayCurrent,multiClipSize,multiClipForIndex,multiClipIndex,multiClipTimeline){
			jump = jump ? parseInt(jump) : parseInt(Sheet.Config.Jump);
			arrayBackup = [];
			arrayCurrent = [];
			SheetTrigger.Input.addClass('multi-clip');
			multiClipSize = Sheet.ArrayMultiple.length;
			for (multiClipForIndex = 0; multiClipForIndex < multiClipSize; multiClipForIndex++){
				multiClipIndex = Sheet.ArrayMultiple[multiClipForIndex];
					if (multiClipIndex >= 0){
					multiClipTimeline = Sheet.ArrayData[multiClipIndex];
					arrayBackup.push({index : multiClipIndex, data : Clone(multiClipTimeline)});
					if (cmd == 'plus'){
						multiClipTimeline.start += jump;
						multiClipTimeline.end && (multiClipTimeline.end += jump);
					} else if (cmd == 'minus'){
						multiClipTimeline.start -= jump, multiClipTimeline.start < 0 && (multiClipTimeline.start = 0);
						multiClipTimeline.end && (multiClipTimeline.end -= jump, multiClipTimeline.end < 0 && (multiClipTimeline.end = 0));
					} else {
						SheetTrigger.Input.html(multiClipTimeline.text).trigger('focus');
						Sheet.Edit.Cmd('selectAll');
						Sheet.Edit.Cmd(cmd);
						multiClipTimeline.text = Subtitle.Encode(SheetTrigger.Input);
					}
					arrayCurrent.push({index : multiClipIndex, data : Clone(multiClipTimeline)});
				}
			}
			SheetTrigger.Input.removeClass('multi-clip');
			Sheet.Init = true;
			Sheet.Convert();
			Sheet.Draw();
			Sheet.Command.m(cmd,arrayCurrent,arrayBackup);
		}),
		TimePlus : (function(jump,clip){
			jump = jump ? parseInt(jump) : parseInt(Sheet.Config.Jump);
			clip = Clone(Sheet.ArrayData[Sheet.Current.row]);
			if (Sheet.Current.target == 'starttime'){
				clip.start += jump;
			} else if (Sheet.Current.target == 'endtime'){
				clip.end += jump;
			}
			Sheet.Command.u(Sheet.Current,clip);
		}),
		TimeMinus : (function(jump,clip){
			jump = jump ? parseInt(jump) : parseInt(Sheet.Config.Jump);
			clip = Clone(Sheet.ArrayData[Sheet.Current.row]);
			if (Sheet.Current.target == 'starttime' && clip.start > 0){
				clip.start -= jump;
				clip.start < 0 && (clip.start = 0);
				Sheet.Command.u(Sheet.Current,clip);
			} else if (Sheet.Current.target == 'endtime' && clip.end > 0){
				clip.end -= jump;
				clip.end < 0 && (clip.end = 0);
				Sheet.Command.u(Sheet.Current,clip);
			}
		}),
		On : function(){
			if (!Sheet.Search.State){
				Sheet.Search.Panel && $('#sheet-search').trigger('click');
				Sheet.Edit.State = true;
				SheetTrigger.Wrap.addClass('on');
				$('#sheet-edit').addClass('on');
				SheetTrigger.Input.html(Sheet.Current.data[Sheet.Current.target] + '<br>');
				if (!SheetTrigger.Input.is(':focus')){
					setTimeout(function(){
						SheetTrigger.Input.focus();
						Sheet.Edit.Cmd('selectAll');
					});
				} else {
					Sheet.Edit.Cmd('selectAll');
				}
				Sheet.Draw();
			}
		},
		Off : (function(clip, colText){
			Sheet.Edit.Cmd('unselect');
			Sheet.Edit.State = false;
			$('#sheet-edit').removeClass('on');
			SheetTrigger.Wrap.removeClass('on').removeClass('clip');
			clip = Clone(Sheet.Current.data);
			colText = Subtitle.Encode(SheetTrigger.Input);
			if (clip[Sheet.Current.target] != colText){
				clip[Sheet.Current.target] = colText;
				Sheet.Command.u(Sheet.Current,clip);
			}
			Sheet.Move.Event();
		}),
		Clip : function(cmd, clip){
			Sheet.Search.Panel && $('#sheet-search').trigger('click');
			if (Sheet.Edit.State){
				if (cmd) Sheet.Edit.Cmd(cmd);
			} else {
				Sheet.Edit.State = true;
				SheetTrigger.Input.html(Sheet.Current.data[Sheet.Current.target]);
				SheetTrigger.Wrap.addClass('clip');
				SheetTrigger.Wrap.trigger('focus');
				SheetTrigger.Input.trigger('focus');
				Sheet.Edit.Cmd('selectAll');
				if (cmd) Sheet.Edit.Cmd(cmd);
				setTimeout(function(){
					Sheet.Edit.Off();
				});
			}
		},
		Color : {
			Set : function(colors,colorsSize,colorIndex){
				if (!Sheet.Edit.Color.List){
					Sheet.Edit.Color.List = ['#ff0000','#ff00ff','#aa00ff','#0000ff','#00ffff','#00ff00','#ffff00','#ffaa00'];
					colors = Fn.Data('get','CaptionColorTemp');
					if (colors && colors != '' && colors.length > 0){
						colorsSize = colors.length;
						for (colorIndex = 0; colorIndex < colorsSize; colorIndex++){
							Sheet.Edit.Color.List[colorIndex] = colors[colorIndex];
						}
					}
				} else {
					Fn.Data('set','CaptionColorTemp',Sheet.Edit.Color.List);
				}
				$('.color-list').each(function(count,section,colorSize,panel,singleColor){
					section = $(section).find('.color-panel');
					colorSize = Sheet.Edit.Color.List.length;
					while (colorSize--){
						singleColor = Sheet.Edit.Color.List[colorSize];
						panel = section.eq(colorSize);
						panel.find('.color').css('background-color',singleColor).attr('title',singleColor);
						panel.find('.hex').text(singleColor);
					}
				});
			},
			Event : function(picker, dialog){
				dialog = Interface.ColorPicker.parents('.dialog');
				dialog.find('.btn-color').on('click',function(me, parent, eq){
					me = $(this),
					parent = me.parent(),
					eq = me.parent().index();
					Interface.ColorPicker.ColorPickerSetColor(Sheet.Edit.Color.List[eq]).ColorPickerSubmit(function(hsb,hex,rgb){
						Sheet.Edit.Color.List[eq] = '#'+hex;
						Sheet.Edit.Color.Set(Sheet.Edit.Color.List);
					});
					dialog.find('li.current').removeClass('current');
					parent.addClass('current');
					return false;
				});
			},
			Init : function(){
				Sheet.Edit.Color.Set();
				$('#color-1').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color0');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color0');
						}
					}
					return false;
				});
				$('#color-2').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color1');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color1');
						}
					}
					return false;
				});
				$('#color-3').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color2');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color2');
						}
					}
					return false;
				});
				$('#color-4').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color3');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color3');
						}
					}
					return false;
				});
				$('#color-5').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color4');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color4');
						}
					}
					return false;
				});
				$('#color-6').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color5');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color5');
						}
					}
					return false;
				});
				$('#color-7').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color6');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color6');
						}
					}
					return false;
				});
				$('#color-8').off('click').on('click',function(){
					if (!$(this).hasClass('disabled')){
						if (Sheet.Multiple.State){
							Sheet.Edit.MultiClip('color7');
						} else if (Sheet.Current.target == 'text' || Sheet.Current.target == 'memo'){
							Sheet.Edit.Clip('color7');
						}
					}
					return false;
				});

				Interface.ColorPicker = $('#color-selector').find('.picker').ColorPicker();
				Sheet.Edit.Color.Event();
				$('#color-select').on('click',function(me){
					Interface.Dialog('color-selector');
					Interface.ColorPicker.parents('.dialog').find('.btn-color').eq(0).trigger('click');
					return false;
				});
			} 
		},
		Cmd : function (cmd, attr, value, textRange, range, tempEl){
			if (typeof cmd === 'string'){
				if (cmd.indexOf('color_clear') == 0){
					attr = 'removeFormat';
					value = 'foreColor';
				} else if (cmd.indexOf('color') == 0){
					attr = 'foreColor';
					value = Sheet.Edit.Color.List[cmd.replace('color','')];
				} else if (cmd == 'enter'){
					if ($.browser.mozilla){
						attr = 'insertHTML';
						value = "<br />";
					} else {
						attr = 'insertLineBreak';
					}
				} else {
					attr = cmd;
				}
			} else {
				attr = cmd.attr === 'color' ? 'foreColor' : cmd.attr;
				value = cmd.value;
			}
			document.execCommand(attr, false, value);
			return false;
		},
		Log : function(c,i,n,o,p){
			Fn.Log.Update({cmd:c,id:i,n:n,o:o,current:p});
			Sheet.Edit.History();
		},
		History : function(count, index, undo, redo){
			count = Fn.Log.ArrayData.length;
			index = Fn.Log.Index + 1;
			undo = $('#undo');
			redo = $('#redo');
			if (count === 0){
				undo.addClass('disabled');
				redo.addClass('disabled');
			} else if (index === 0){
				undo.addClass('disabled');
				redo.removeClass('disabled');
			} else if (count === index){
				undo.removeClass('disabled');
				redo.addClass('disabled');
			} else {
				undo.removeClass('disabled');
				redo.removeClass('disabled');
			}
		}
	};
	Sheet.Move = {
		Target : {
			smi : ['starttime','text','memo'],
			srt : ['starttime','endtime','text','memo']
		},
		Left : {
			smi : [49,229,589],
			srt : [49,149,329,689]
		},
		Event : function (){
			Sheet.Current.target = Sheet.Move.Target[Sheet.Format][Sheet.Current.col];
			Sheet.Current.info = Sheet.ArrayInfo[Sheet.Current.row];
			Sheet.Current.data = Sheet.ArrayData[Sheet.Current.row];
			Sheet.Panel.find('.col.current').removeClass('current');
			SheetTrigger.Focus(Sheet.Panel.find('.row-'+Sheet.Current.row).children('.col-'+Sheet.Current.col).addClass('current'));
		},
		Page : {
			Prev : function(inputOffset,inputHeight,canvasTop,canvasBottom,moveSize,moveData,moveScroll){
				if (Sheet.Current.row > 0){
					Sheet.Edit.State && Sheet.Edit.Off();
					inputOffset = SheetTrigger.Wrap.position().top;
					inputHeight = SheetTrigger.Wrap.height();
					canvasTop = Sheet.Scroll;
					canvasBottom = Sheet.Scroll + Sheet.Canvas.Height;
					canvasBottom < inputOffset - inputHeight && (moveScroll = true);
					if (canvasTop >= inputOffset || canvasBottom < inputOffset - inputHeight){
						moveSize = inputOffset - Sheet.Canvas.Height * 0.875;
					} else {
						moveSize = canvasTop;
					}
					moveSize < 0 && (moveSize = 0);
					moveData = (function(sheetArrayHeight,currentOffset,timelineOffset,timelineIndex,timelineHeight){
					for (
						timelineOffset=timelineIndex=0;
						timelineHeight=sheetArrayHeight[timelineIndex++];
						timelineOffset+=timelineHeight
					) 
					if(timelineOffset>currentOffset)
						return{offset:timelineOffset - timelineHeight, index:timelineIndex-2};
					})(Sheet.ArrayHeight, moveSize);
					!moveData && (moveData = {offset : 0, index : 0});
					Sheet.Current.row = moveData.index;
					Sheet.Move.Event();
					moveScroll && setTimeout(function(){Sheet.Body.scrollTop(moveData.offset)});
				}
			},
			Next : function(inputOffset,inputHeight,canvasTop,canvasBottom,moveSize,moveData,moveScroll){
				if (Sheet.Current.row < Sheet.DataSize){
					Sheet.Edit.State && Sheet.Edit.Off();
					inputOffset = SheetTrigger.Wrap.position().top;
					inputHeight = SheetTrigger.Wrap.height();
					canvasTop = Sheet.Scroll - 1;
					canvasBottom = Sheet.Scroll + Sheet.Canvas.Height;
					if (canvasTop > inputOffset || canvasBottom <= inputOffset + inputHeight){
						moveSize = inputOffset + Sheet.Canvas.Height * 0.875;
						moveScroll = true;
					} else {
						moveSize = canvasBottom;
					}
					moveData = (function(sheetArrayHeight,currentOffset,timelineOffset,timelineIndex,timelineHeight){
					for (
						timelineOffset=timelineIndex=0;
						timelineHeight=sheetArrayHeight[timelineIndex++];
						timelineOffset+=timelineHeight
					) 
						if(timelineOffset>currentOffset)
							return{offset:timelineOffset, index:timelineIndex-2};
					})(Sheet.ArrayHeight, moveSize);
					!moveData && (moveData = {offset : Sheet.Height - Sheet.ArrayHeight[Sheet.DataSize], index : Sheet.DataSize});
					Sheet.Current.row = moveData.index;
					Sheet.Move.Event();
					moveScroll && Sheet.Body.scrollTop(moveData.offset - Sheet.Canvas.Height);
				}
			}
		},
		Row : {
			Prev : function(){
				if (Sheet.Current.row>0){
					--Sheet.Current.row;
					Sheet.Move.Event();
					if (Sheet.Multiple.State){
						if (Sheet.Shift){
							Sheet.Multiple.Checking(Sheet.Current.row);
						} else {
							Sheet.Multiple.Start = Sheet.Current.row;
						}
					}
				}
			},
			Next : function(append){
				if (Sheet.Current.row != Sheet.DataSize){
					++Sheet.Current.row;
					Sheet.Move.Event();
					if (Sheet.Multiple.State){
						if (Sheet.Shift){
							Sheet.Multiple.Checking(Sheet.Current.row);
						} else {
							Sheet.Multiple.Start = Sheet.Current.row;
						}
					}
				} else if (!Sheet.Multiple.State && append){
					Sheet.Command.i(Sheet.Current);
				}
			}
		},
		Col : {
			Prev : function(){
				if (Sheet.Current.col > 0){
					--Sheet.Current.col;
					Sheet.Move.Event();
				} else if (Sheet.Current.row > 0 && !Sheet.Multiple.State){
					switch (Sheet.Format){
						case 'srt' : Sheet.Current.col = 3;break;
						case 'smi' : Sheet.Current.col = 2;break;
					}
					Sheet.Move.Row.Prev();
				} else {
					return false;
				}
			},
			Next : function(maxCol){
				switch (Sheet.Format){
					case 'srt' : maxCol = 3;break;
					case 'smi' : maxCol = 2;break;
				}
				if (Sheet.Current.col < maxCol){
					++Sheet.Current.col;
					Sheet.Move.Event();
				} else if (Sheet.Current.row < Sheet.DataSize && !Sheet.Multiple.State ){
					Sheet.Current.col = 0;
					Sheet.Move.Row.Next(false);
				}
			}
		}
	};
	Sheet.ColWidth = {
		starttime	: function(){return 101},
		endtime		: function(){return 101},
		text		: function(){return 361},
		memo		: (function(){
			if (Sheet.Format == 'smi'){
				return Sheet.Canvas.Width - 589;
			} else if (Sheet.Format == 'srt'){
				return Sheet.Canvas.Width - 689;
			}
		})
	}
	Sheet.DrawHTML = {
		smi : (function(drawData,drawCount,drawHeight,drawTimeline,drawRange,drawHtml,drawTimelineInfo){
			drawHtml='',
			drawCount=Sheet.ArrayData.length,
			drawHeight= 0,
			drawData.index = drawData.index < 0 ? 0 : drawData.index;
			while (drawData.index < drawCount && Sheet.Canvas.DrawHeight >= drawHeight) {
				drawTimeline = Sheet.ArrayData[drawData.index];
				drawTimelineInfo = Sheet.ArrayInfo[drawData.index];
				drawRange = drawData.index < drawCount - 1;
				if (drawTimeline){
					drawRange && (drawTimeline.end = Sheet.ArrayData[drawData.index + 1].start);
					drawHtml += '<div class="sheet-row row-' + drawData.index;
					Sheet.ArrayError.indexOf(drawData.index) > -1 && (drawHtml += ' error');
					Sheet.ArrayMultiple.indexOf(drawData.index) > -1 && (drawHtml += ' multiple');
					drawHtml += '">';
					drawHtml += '<div class="col index"><div class="cell">'+ (drawData.index + 1) + '</div></div>';
					drawHtml += '<div class="col col-0 starttime';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="0" data-left="49" data-target="starttime"><div class="cell">'+ drawTimelineInfo.starttime + '</div></div>';
					drawHtml += '<div class="col dur"><div class="cell">' + (drawRange ? ((drawTimeline.end - drawTimeline.start) / 1000).toFixed(3) : '') + '</div></div>';
					drawHtml += '<div class="col col-1 text';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="1" data-left="229" data-target="text"><div class="cell">'+ drawTimeline.text + '<br></div></div>';
					drawHtml += '<div class="col col-2 memo';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="2" data-left="589" data-target="memo"><div class="cell" style="-webkit-line-clamp:' + drawTimelineInfo.line + ';max-height:'+ (drawTimelineInfo.height - 3) +'px;">'+ (drawTimeline.memo ? drawTimeline.memo : '') + '<br></div></div>';
					drawHtml += '</div>';
				}
				drawHeight += Sheet.ArrayHeight[drawData.index];
				drawData.index++;
			}
			return drawHtml;
		}),
		srt : (function(drawData,drawCount,drawHeight,drawTimeline,drawRange,drawHtml){
			drawHtml='',
			drawCount=Sheet.ArrayData.length,
			drawHeight= 0,
			drawData.index = drawData.index < 0 ? 0 : drawData.index;
			while (drawData.index < drawCount && Sheet.Canvas.DrawHeight >= drawHeight) {
				drawTimeline = Sheet.ArrayData[drawData.index];
				drawTimelineInfo = Sheet.ArrayInfo[drawData.index];
				drawRange = drawData.index < drawCount - 1;
				if (drawTimeline){
					drawHtml += '<div class="sheet-row row-' + drawData.index;
					Sheet.ArrayError.indexOf(drawData.index) > -1 && (drawHtml += ' error');
					Sheet.ArrayMultiple.indexOf(drawData.index) > -1 && (drawHtml += ' multiple');
					drawHtml += '">';
					drawHtml += '<div class="col index"><div class="cell">'+ (drawData.index + 1) + '</div></div>';
					drawHtml += '<div class="col col-0 starttime';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="0" data-left="49" data-target="starttime"><div class="cell">'+ drawTimelineInfo.starttime + '</div></div>';
					drawHtml += '<div class="col col-1 endtime';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="1" data-left="149" data-target="endtime"><div class="cell">'+ drawTimelineInfo.endtime + '</div></div>';
					drawHtml += '<div class="col dur"><div class="cell">' + ((drawTimeline.end - drawTimeline.start) / 1000).toFixed(3) + '</div></div>';
					drawHtml += '<div class="col col-2 text';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="2" data-left="329" data-target="text"><div class="cell">'+ drawTimeline.text + '<br></div></div>';
					drawHtml += '<div class="col col-3 memo';
					drawHtml += '" tabindex="-1" data-row="'+ drawData.index + '" data-col="3" data-left="689" data-target="memo"><div class="cell" class="cell" style="-webkit-line-clamp:' + drawTimelineInfo.line + ';max-height:'+ (drawTimelineInfo.height - 3) +'px;">'+ (drawTimeline.memo ? drawTimeline.memo : '') + '<br></div></div>';
					drawHtml += '</div>';
				}
				drawHeight += Sheet.ArrayHeight[drawData.index];
				drawData.index++;
			}
			return drawHtml;
		})
	};
	Sheet.Draw = (function(drawScroll,drawData){
		drawScroll = Sheet.Body.scrollTop();
		if (Sheet.Init || drawScroll != Sheet.Scroll || Sheet.Height < Sheet.Canvas.Height){
			Sheet.Init		= null;
			drawData		= (function(sheetArrayHeight,currentOffset,timelineOffset,timelineIndex,timelineHeight){
				for (
					timelineOffset=timelineIndex=0;
					timelineHeight=sheetArrayHeight[timelineIndex++];
					timelineOffset+=timelineHeight
				) 
					if(timelineOffset>currentOffset)
						return{offset:timelineOffset, index:timelineIndex-1};
			})(Sheet.ArrayHeight, drawScroll-Sheet.Canvas.Height);
			Sheet.Scroll	= drawScroll;
			if (drawData){
				Sheet.Panel.css('padding-top',drawData.offset+'px');
				Sheet.Panel[0].innerHTML = Sheet.DrawHTML[Sheet.Format](drawData);
				Sheet.Panel.find('.row-'+Sheet.Current.row).find('.col-'+Sheet.Current.col).addClass('current');
				Sheet.Focus && Sheet.Panel.find('.row-'+Sheet.Focus).addClass('focus');
				if (Sheet.ArraySearch.length > 0){
					(function(arraySearch,reverseIndex,item){
						reverseIndex = arraySearch.length;
						while (reverseIndex--){
							item = Sheet.ArraySearch[reverseIndex];
							Sheet.Panel.find('.row-' + item.row).find('.col-' + item.col).addClass('search');
						}
					})(Sheet.ArraySearch);
				}
			}
		}
	});
	Sheet.StateUpdate = function(){
		Wn.originHeight			= Wn.height();
		Sheet.Canvas.Width		= Sheet.Contain.width();
		Sheet.Canvas.Height		= Sheet.Body.parent().height();
		Sheet.Canvas.DrawHeight	= Sheet.Canvas.Height * 3;
		if (Sheet.Head){
			Sheet.Head.width(Sheet.Canvas.Width);
			Sheet.Head.css('left', 320 - Sheet.Body.scrollLeft());
		}
		Sheet.Current.target && SheetTrigger.Input.css({'min-width' : Sheet.ColWidth[Sheet.Current.target]()});
	};
	Sheet.Convert = (function(){
		Sheet.StateUpdate();
		Sheet.ArraySearch		= [];
		Sheet.ArrayInfo			= [];
		Sheet.ArrayHeight		= [];
		Sheet.ArrayError		= [];
		Sheet.Height			= 0;
		Sheet.DataSize			= Sheet.ArrayData.length - 1;
		(function(arrayData,arrayInfo,arrayEq,arrayIndex,timelineData,timelineInfo,nextData){
			for (arrayEq=arrayIndex=0;timelineData=arrayData[arrayIndex++];arrayEq=arrayIndex){
				timelineInfo = {};
				if (isNaN(timelineData.start) && !isNaN(timelineData.sync)) timelineData.start = timelineData.sync;
				timelineInfo.line = timelineData.text.split('<br').length,
				nextData=arrayData[arrayIndex],
				timelineInfo.height=timelineInfo.line*Sheet.LineHeight+Sheet.CellPadding,
				Sheet.Height+=timelineInfo.height,
				Sheet.ArrayHeight[arrayEq]=timelineInfo.height,
				timelineInfo.starttime=Fn.Hour(timelineData.start),
				"srt"==Sheet.Format&&(timelineInfo.endtime=Fn.Hour(timelineData.end)),
				nextData&&(timelineInfo.next=Number(nextData.start));
				if (Sheet.Format == 'srt'){
					if (arrayEq < Sheet.DataSize && Number(timelineData.end) > Number(timelineInfo.next)) Sheet.ArrayError.push(arrayEq);
					else if (Number(timelineData.end) < Number(timelineData.start)) Sheet.ArrayError.push(arrayEq);
				} else if (Sheet.Format == 'smi'){
					if (arrayEq < Sheet.DataSize && Number(timelineData.start) > Number(timelineInfo.next)) Sheet.ArrayError.push(arrayEq);
				}
				arrayInfo[arrayEq] = timelineInfo;
			}
		})(Sheet.ArrayData,Sheet.ArrayInfo);
		Sheet.Contain.height(Sheet.Height);
		Sheet.Search.Error(Sheet.ArrayError);
	});
	Sheet.Set = (function(o){
		SheetTrigger.Init = null;
		!Sheet.Format && !o.Format && (Sheet.Format = Fn.Data('get','format'));
		if (!Sheet.Format || Sheet.Format == '') Sheet.Format = 'smi';
		if (o.Format && o.format != Sheet.Format){
			Sheet.Format = o.Format;
			if (Sheet.Format == 'smi' && Sheet.Current.col > 0) --Sheet.Current.col;
			if (Sheet.Format == 'srt' && Sheet.Current.col > 0) ++Sheet.Current.col;
		}
		if (o) Extend(Sheet, o);
		if (!o.ArrayData && Sheet.ArrayData.length == 0) Sheet.ArrayData = Fn.Data('get','SUBTITLE_TEMP');
		if (!Sheet.ArrayData || Sheet.ArrayData == '' || Sheet.ArrayData.length == 0) Sheet.ArrayData = [Sheet.Empty];
		Fn.Data('set','SUBTITLE_TEMP', Sheet.ArrayData);

		Sheet.Interface.removeAttr('class').addClass(Sheet.Format);
		Sheet.Head = Sheet.Interface.children('.sheet-head');

		Sheet.Head.children('.sheet-panel')[0].innerHTML = (function(h,c,t){
			t = '<div class="sheet-row">';
			for (c in h){
				if (typeof h[c] === 'string') t += '<div class="'+ h[c] + ' col"><div class="cell">'+ i18n.t(h[c]+ '-' +Sheet.Format) +'</div></div>';
			}
			t += '</div>';
			return t;
		})(Subtitle.Header[Sheet.Format]);
		Sheet.Convert();
		Sheet.Init = true;
		Sheet.Draw();
		setTimeout(function(){
			Object.keys(Sheet.Current).length == 0 && Sheet.Panel.find('.text').eq(0).trigger('click');
		});
	});
	Sheet.Click = (function(col, context, current){
		if (Sheet.Edit.State) Sheet.Edit.Off();
		col =$(col);
		current = col.data();
		Sheet.Multiple.State && Sheet.Multiple.Checking(current.row);
		if (Object.keys(current).length > 0){
			if (Sheet.Current.row!=current.row||Sheet.Current.col!=current.col){
				Sheet.Active = Sheet.Current = current;
				Sheet.Current.info = Sheet.ArrayInfo[current.row];
				Sheet.Current.data = Sheet.ArrayData[current.row];
				Sheet.Active = Sheet.Current;
				Sheet.Panel.find('.col.current').removeClass('current');
				SheetTrigger.Focus(col.addClass('current'));
			}
			if (!Sheet.Multiple.State && context){
				if (current.target == 'text' || current.target == 'memo') Sheet.Edit.On(); 
			}
		};
		return false;
	});
	Sheet.Init = (function(target){
		Sheet.Interface		= $(target);
		Sheet.Contain		= Sheet.Interface.find('.sheet-contain');
		Sheet.Panel			= Sheet.Contain.children('.sheet-panel');
		Sheet.Interface.find('.sheet-body').scrollbar();
		Sheet.Body			= Sheet.Interface.find('.sheet-body.scroll-content');

		Sheet.Panel
		.on(Ev.Click,'.col',function(e,current){
			Sheet.Shift = e.shiftKey;
			current = $(this).data();
			(!Ev.Current||Ev.Current.row==current.row&&Ev.Current.col==current.col)&&(Ev.ClickCount++,Ev.Current=current);
			if (Ev.ClickCount === 1) {
				if (!Sheet.IsMultiple) Sheet.Click(this);
				Ev.singleClickTimer = setTimeout(function() {
					Ev.Current = null;
					Ev.ClickCount = 0;
				}, 400);
			} else if (Ev.ClickCount === 2) {
				if (!Sheet.IsMultiple) Sheet.Click(this, true);
				Ev.Current = null;
				Ev.ClickCount = 0;
			}
			return false;
		})
		.on(Ev.Context,'.col',function(){
			if (!Sheet.IsMultiple) Sheet.Click(this, true);
			return false;
		});

		Sheet.Body
		.off(Ev.Scroll).on(Ev.Scroll, function(){
			Sheet.StateUpdate();
			Sheet.Draw();
		})
		.off(Ev.ScrollEnd).on(Ev.ScrollEnd, function(){
			Sheet.Init = true;
			Sheet.Draw();
		});
		Wn.off(Ev.Resize+'.sh').on(Ev.Resize+'.sh', function(){
			Sheet.StateUpdate();
			Wn.originHeight != Wn.height() && (Sheet.Init = true, Sheet.Draw());
		}).off(Ev.Blur).on(Ev.Blur,function(){
			if (Sheet.Edit.State){
				Sheet.Edit.Cmd('unselect');
				Sheet.Edit.Off();
			}
		});
		SheetTrigger.Init();
		Sheet.Edit.Color.Init();
		$('#time-edit').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Interface.Dialog('time-editor');
			}
			return false;
		});
		$('#time-plus').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('plus');
				} else if (Sheet.Current.target == 'starttime' || Sheet.Current.target == 'endtime'){
					Sheet.Edit.TimePlus();
				}
			}
			return false;
		});
		$('#time-minus').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('minus');
				} else if (Sheet.Current.target == 'starttime' || Sheet.Current.target == 'endtime'){
					Sheet.Edit.TimeMinus();
				}
			}
			return false;
		});
		$('#sheet-edit').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Edit.State) Sheet.Edit.Off();
				else  Sheet.Edit.On();
			}
			return false;
		});
		$('#sheet-insert').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Sheet.Command.i(Sheet.Current);
			}
			return false;
		});
		$('#sheet-remove').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Sheet.Command.r(Sheet.Current);
			}
			return false;
		});
		$('#sheet-multiple').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Sheet.Multiple.Toggle();
			}
			return false;
		});
		$('#font-bold').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('bold');
				} else {
					Sheet.Edit.Clip('bold');
				}
			}
			return false;
		});
		$('#font-italic').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('italic');
				} else {
					Sheet.Edit.Clip('italic');
				}
			}
			return false;
		});
		$('#font-underline').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('underline');
				} else {
					Sheet.Edit.Clip('underline');
				}
			}
			return false;
		});

		$('#color-reset').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				if (Sheet.Multiple.State){
					Sheet.Edit.MultiClip('color_clear');
				} else {
					Sheet.Edit.Clip('color_clear');
				}
			}
			return false;
		});

		$('#undo').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Sheet.Undo();
			}
			return false;
		});
		$('#redo').off('click').on('click',function(){
			if (!$(this).hasClass('disabled')){
				Sheet.Redo();
			}
			return false;
		});
		$('#new-sheet').off('click').on('click',function(){
			$('#nav-trigger').trigger('click');
			Interface.Confirm({
				title:i18n.t('new-file'),
				content:i18n.t('new-file-contents'),
				bgDismiss:true,
				success:function(){
					Sheet.Set({
						ArrayData : []
					});
					Sheet.Current.row = 0;
					Sheet.Current.col = 0;
					Sheet.Move.Event();
					Fn.Log.Clear();
					Sheet.Edit.History();
				}
			});
		});
	});
	Do.on('ready', function(){
		Interface.Tab();
		Interface.Dialog();
		Interface.InputFile();
		Interface.Select.Init();
		Sheet.Init('#sheet');
		Sheet.Edit.TimeControl();
		Sheet.Search.Init();
		Sheet.Config.Init();
		Shortkey.Init();
		Video.Init();
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
				color		= Fn.Data('get','color');
				format		= Fn.Data('get','format');
				language	= Fn.Data('get','language');
				data		= Fn.Data('get','SUBTITLE_TEMP');

				if (!format || format == '') format = Sheet.Format;
				if (!language || language == '' || !i18n.getLocale(language)) language = Sheet.Language;
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
	Wn.on(Ev.Resize, function(){
	});
//})(jQuery,document,window,WebFont,$.Shortcuts);

Date.prototype.format=function(a){if(!this.valueOf())return' ';var b,c=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],d=this;return a.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|ms|a\/p)/gi,function(a){switch(a){case'yyyy':return d.getFullYear();case'yy':return(d.getFullYear()%1e3).zf(2);case'MM':return(d.getMonth()+1).zf(2);case'dd':return d.getDate().zf(2);case'E':return c[d.getDay()];case'HH':return d.getHours().zf(2);case'hh':return((b=d.getHours()%12)?b:12).zf(2);case'mm':return d.getMinutes().zf(2);case'ss':return d.getSeconds().zf(2);case'ms':return d.getMilliseconds().zf(3);case'a/p':return d.getHours()<12?'오전':'오후';default:return a}})},String.prototype.string=function(a){for(var b='',c=0;c++<a;)b+=this;return b},String.prototype.zf=function(a){return'0'.string(a-this.length)+this},Number.prototype.zf=function(a){return this.toString().zf(a)},Array.prototype.find||(Array.prototype.find=function(a,b){try{var c=Object(this);if('function'!=typeof a)throw new TypeError;for(var e,d=c.length,f=0;f<d;f++)if(f in c&&(e=c[f],a.call(b,e,f,c)))return e;return}finally{c=null,d=null,f=null,e=null}}),Array.prototype.findIndex||(Array.prototype.findIndex=function(a,b){var c=Object(this);if('function'!=typeof a)throw new TypeError;for(var d,e=c.length,f=0;f<e;f++)if(f in c&&(d=c[f],a.call(b,d,f,c)))return f;return-1});
function Clone(a){var b,c;if("object"!=typeof a)return a;if(!a)return a;if("[object Array]"===Object.prototype.toString.apply(a)){for(b=[],c=0;c<a.length;c+=1)b[c]=Clone(a[c]);return b}b={};for(c in a)a.hasOwnProperty(c)&&(b[c]=Clone(a[c]));return b}
function Capitalize(string){return string[0].toUpperCase()+string.slice(1);}
function Extend(a,b,c){for(c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}
var Toast;!function(t){function a(t,a,n){d("info",t,a,n)}function n(t,a,n){d("warning",t,a,n)}function i(t,a,n){d("error",t,a,n)}function o(t,a,n){d("success",t,a,n)}function d(a,n,i,o){void 0===o&&(o={}),o=$.extend({},t.defaults,o),s||(s=$("#toast-container"),0===s.length&&(s=$("<div>").attr("id","toast-container").appendTo($("body")))),o.width&&s.css({width:o.width});var d=$("<div>").addClass("toast").addClass("toast-"+a);if(i){var e=$("<div>").addClass("toast-title").append(i);d.append(e)}if(n){var r=$("<div>").addClass("toast-message").append(n);d.append(r)}o.displayDuration>0&&setTimeout(function(){d.fadeOut(o.fadeOutDuration,function(){d.remove()})},o.displayDuration),d.on("click",function(){d.remove()}),s.prepend(d)}t.defaults={width:"",displayDuration:2e3,fadeOutDuration:800},t.info=a,t.warning=n,t.error=i,t.success=o;var s}(Toast||(Toast={}));
