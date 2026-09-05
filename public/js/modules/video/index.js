import { createPlayer } from './player.js';
import { storage } from '../utils/storage.js';
import { clone } from '../utils/object.js';
import { bindEvent, toElement } from '../utils/dom.js';
import { trackEvent } from '../analytics/track.js';

/**
 * @typedef {Object} VideoInitDeps
 * @property {object} ui - UI ??
 * @property {object} sheet - ??? API
 * @property {object} i18n - i18n ???
 */

const hasSheetFocus = (sheet) => sheet.focus != null;

const TIME_TRIGGER_HTML = '<button class="vjs-selecttime-control vjs-control vjs-button mt icon-timer" type="button" aria-live="polite"><span class="vjs-control-text">select time</span></button>';

/**
 * @param {VideoInitDeps & { player: object }} deps
 */
const createVideo = ({ player, ui, sheet, i18n }) => {
	const video = {};

	const currentTimeMs = () => parseInt(video.currentTime() * 1000);

	const handleTimeTriggerClick = () => {
		if (sheet.format == 'smi' && sheet.current.col > 0) {
			sheet.current.col = 0;
			sheet.current.target = 'starttime';
			sheet.move.event();
		}
		const target = sheet.current.target;
		if (sheet.multiple.state || target.indexOf('time') < 0) return;

		const timeline = clone(sheet.timelines[sheet.current.row]);
		if (target == 'starttime') timeline.start = currentTimeMs();
		else if (target == 'endtime') timeline.end = currentTimeMs();
		sheet.command.update(sheet.current, timeline);
	};

	const attachTimeTrigger = () => {
		const controlBar = document.querySelector('.vjs-control-bar');
		if (!controlBar) return;
		controlBar.insertAdjacentHTML('beforeend', TIME_TRIGGER_HTML);
		const timeTrigger = controlBar.querySelector('.vjs-selecttime-control');
		bindEvent({
			target: timeTrigger,
			event: 'click',
			handler: handleTimeTriggerClick,
		});
	};

	const input = (type, src) => {
		player.refresh();
		if (!src || src == '') {
			toElement(ui.wrap)?.classList.add('empty');
			ui.alert(player.empty(type));
			return;
		}

		toElement(ui.wrap)?.classList.remove('empty');
		player.load(type, src);
		if (!player.interface) {
			toElement(ui.wrap)?.classList.add('empty');
			return;
		}
		attachTimeTrigger();
		player.interface.on('ended', () => {
			player.syncFromTime(-1);
		});
		player.interface.on('timeupdate', function () {
			player.syncFromTime(this.currentTime());
		});
		ui.dialog.close();
		trackEvent({ category: 'Player', action: type + ' Input', label: 'Video Input' });
	};

	video.init = () => {
		player.refresh();
		document.querySelectorAll('.video-load').forEach((button) => {
			bindEvent({
				target: button,
				event: 'click',
				handler: () => {
					const tab = button.closest('.ui-tab');
					const panel = tab?.querySelector('.tab-panel.on');
					const type = panel?.dataset.type;
					const inputEl = panel?.querySelector('input');
					const data = type == 'file' ? inputEl?.files[0] : inputEl?.value;
					input(type, data);
				},
			});
		});
		bindEvent({
			target: player.subtitle,
			event: 'click',
			selector: '.move-current',
			handler: () => {
				if (hasSheetFocus(sheet)) sheet.rowOffset(sheet.focus);
			},
		});
		bindEvent({
			target: player.subtitle,
			event: 'click',
			selector: '.move-prev',
			handler: () => {
				if (!hasSheetFocus(sheet)) return;
				const focus = sheet.focus > 0 ? sheet.focus - 1 : 0;
				video.currentTime(sheet.timelines[focus].start / 1000);
				sheet.render();
			},
		});
		bindEvent({
			target: player.subtitle,
			event: 'click',
			selector: '.move-next',
			handler: () => {
				if (!hasSheetFocus(sheet)) return;
				const focus = sheet.focus < sheet.lastIndex ? sheet.focus + 1 : sheet.lastIndex;
				video.currentTime(sheet.timelines[focus].start / 1000);
				sheet.render();
			},
		});
		bindEvent({
			target: player.subtitle,
			event: 'click',
			selector: '.subtitle-visible',
			handler: () => {
				player.wrap.classList.toggle('overlap');
				storage.set('subtitle-visible', player.wrap.classList.contains('overlap'));
			},
		});
		const savedOverlap = storage.get('subtitle-visible');
		if (savedOverlap != null) player.wrap.classList.toggle('overlap', Boolean(savedOverlap));
	};

	video.fileCheck = (field, file) => {
		const fieldEl = toElement(field);
		const format = file ? player.element.canPlayType(file.type) : '';
		if (!file || format == '') {
			fieldEl?.classList.add('empty');
			const fileInput = fieldEl?.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = '';
			const filename = fieldEl?.querySelector('.i-filename');
			if (filename) filename.textContent = '';
			ui.alert(i18n.t('not-support-file-format'));
		}
	};

	video.toggle = () => {
		if (player.interface.paused()) player.interface.play();
		else player.interface.pause();
	};

	video.volume = (s) => {
		if (!player.interface) return 0;
		if (s || s == 0) {
			s = s <= 0 ? 0 : (s > 1 ? 1 : s);
			player.interface.volume(s);
			return s;
		}
		return player.interface.volume();
	};

	video.currentTime = (s) => {
		if (!player.interface) return 0;
		if (s || s == 0) {
			player.interface.currentTime(s);
			return s;
		}
		return player.interface.currentTime();
	};

	return video;
};

/**
 * video ?????? ????? ???????. `initialize()` ??? ?????? ???? API?? ????.
 *
 * @returns {{
 *   initialize: (deps: VideoInitDeps) => void,
 *   init?: () => void,
 *   fileCheck?: Function,
 *   toggle?: Function,
 *   volume?: Function,
 *   currentTime?: Function,
 * }}
 */
const videoModule = () => {
	const module = {};

	/**
	 * player?? ????? ???? Video API?? ??????. `Do.on('ready')`???? sheet??ui ??? ?? ??????.
	 *
	 * @param {VideoInitDeps} deps
	 */
	module.initialize = ({ ui, sheet, i18n }) => {
		const player = createPlayer({ ui, sheet, i18n });
		Object.assign(module, createVideo({ player, ui, sheet, i18n }));
	};

	return module;
};

export default videoModule;
