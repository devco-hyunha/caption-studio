import { createPlayer } from './player.js';
import { storage } from '../utils/storage.js';
import { clone } from '../utils/object.js';
import { bindEvent } from '../utils/dom.js';
import { trackEvent } from '../analytics/track.js';

/**
 * @typedef {Object} VideoConfigureDeps
 * @property {object} ui
 * @property {object} sheet
 * @property {object} i18n
 */

const hasSheetFocus = (sheet) => sheet.focus != null;

const TIME_TRIGGER_HTML = '<button class="vjs-selecttime-control vjs-control vjs-button mt icon-timer" type="button" aria-live="polite"><span class="vjs-control-text">select time</span></button>';

/**
 * @param {VideoConfigureDeps & { player: object }} deps
 */
const createVideo = ({ player, ui, sheet, i18n }) => {
	const video = {};

	const currentTimeMs = () => parseInt(video.currentTime() * 1000);

	const handleTimeTriggerClick = () => {
		if (sheet.format === 'smi' && sheet.current.col > 0) {
			sheet.current.col = 0;
			sheet.current.target = 'starttime';
			sheet.move.event();
		}
		const target = sheet.current.target;
		if (sheet.multiple.state || target.indexOf('time') < 0) return;

		const timeline = clone(sheet.timelines[sheet.current.row]);
		if (target === 'starttime') timeline.start = currentTimeMs();
		else if (target === 'endtime') timeline.end = currentTimeMs();
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
		if (!src || src === '') {
			ui.wrap?.classList.add('empty');
			ui.alert(player.empty(type));
			return;
		}

		ui.wrap?.classList.remove('empty');
		player.load(type, src);
		if (!player.interface) {
			ui.wrap?.classList.add('empty');
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
		trackEvent({ category: 'Player', action: `${type} Input`, label: 'Video Input' });
	};

	video.mount = () => {
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
					const data = type === 'file' ? inputEl?.files[0] : inputEl?.value;
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
		const format = file ? player.element.canPlayType(file.type) : '';
		if (!file || format === '') {
			field?.classList.add('empty');
			const fileInput = field?.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = '';
			const filename = field?.querySelector('.i-filename');
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
		if (s || s === 0) {
			s = s <= 0 ? 0 : (s > 1 ? 1 : s);
			player.interface.volume(s);
			return s;
		}
		return player.interface.volume();
	};

	video.currentTime = (s) => {
		if (!player.interface) return 0;
		if (s || s === 0) {
			player.interface.currentTime(s);
			return s;
		}
		return player.interface.currentTime();
	};

	return video;
};

/**
 * video 도메인 모듈을 생성한다. `configure()` 호출 전까지 공개 API가 없다.
 *
 * @returns {{
 *   configure: (deps: VideoConfigureDeps) => void,
 *   mount?: () => void,
 *   fileCheck?: Function,
 *   toggle?: Function,
 *   volume?: Function,
 *   currentTime?: Function,
 * }}
 */
const videoModule = () => {
	const module = {};

	/**
	 * player를 만들고 Video API를 주입한다.
	 *
	 * @param {VideoConfigureDeps} deps
	 */
	module.configure = ({ ui, sheet, i18n }) => {
		const player = createPlayer({ ui, sheet, i18n });
		Object.assign(module, createVideo({ player, ui, sheet, i18n }));

		/** 탭 전환 등 활성 타임라인이 바뀐 뒤 오버레이를 현재 시각 기준으로 다시 맞춘다. */
		sheet.refreshOverlay = () => {
			sheet.focus = null;
			if (!player.interface) {
				player.subtitle?.classList.remove('visible');
				return;
			}
			player.syncFromTime(player.interface.currentTime());
		};
	};

	return module;
};

export default videoModule;
