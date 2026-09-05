import { formatTimecode } from '../utils/time.js';
import { toElement } from '../utils/dom.js';

const PLAYER_TARGET = 'player';
const PLAYER_HTML = '<video id="player" class="video-js" playsinline controls></video>';

const EMPTY_MESSAGE_KEYS = {
	youtube: 'please-input-youtube-url',
	vimeo: 'please-input-vimeo-url',
	url: 'please-input-video-url',
	file: 'please-select-video-file',
};

const createTechOptions = {
	youtube: (src) => ({
		techOrder: ['youtube', 'html5'],
		sources: [{ type: 'video/youtube', src }],
	}),
	vimeo: (src) => ({
		techOrder: ['vimeo', 'html5'],
		sources: [{ type: 'video/vimeo', background: 1, src }],
	}),
};

/**
 * @typedef {Object} PlayerDeps
 * @property {object} ui - UI 셸
 * @property {object} sheet - 시트 API
 * @property {object} i18n - i18n 모듈
 */

/**
 * video.js 인스턴스·소스·오버레이를 생성한다.
 * 공개 조작 API는 `modules/video/index.js`가 이 객체를 사용한다.
 *
 * @param {PlayerDeps} deps
 * @returns {object} player
 */
const createPlayer = ({ ui, sheet, i18n }) => {
	const player = {
		wrap: document.querySelector('#video'),
		subtitle: document.querySelector('#subtitle'),
		element: null,
		interface: null,
	};

	const canPlayType = (mediaType) => player.element.canPlayType(mediaType) != '';

	const attachLocalSource = (src) => {
		player.element.src = src;
		player.interface = videojs(PLAYER_TARGET);
	};

	const alertUnsupported = () => {
		ui.alert(i18n.t('not-support-file-format'));
	};

	const loadTech = (type, src) => {
		player.interface = videojs(PLAYER_TARGET, createTechOptions[type](src));
	};

	const refresh = () => {
		if (player.interface) {
			player.interface.dispose();
		} else if (player.element) {
			player.element.remove();
		}
		player.interface = null;
		player.element = null;
		if (sheet.focus != null) sheet.focus = null;
		player.wrap.querySelector('.contain').insertAdjacentHTML('beforeend', PLAYER_HTML);
		player.element = document.querySelector(`#${PLAYER_TARGET}`);
	};

	const loadByType = {
		youtube: (src) => loadTech('youtube', src),
		vimeo: (src) => loadTech('vimeo', src),
		url: (src) => {
			const ext = src.split('.').pop();
			if (canPlayType(`video/${ext}`)) {
				attachLocalSource(src);
				return;
			}
			alertUnsupported();
			refresh();
		},
		file: (file) => {
			if (!file) return;
			if (!canPlayType(file.type)) {
				alertUnsupported();
				return;
			}
			const url = window.URL || window.webkitURL;
			attachLocalSource(url.createObjectURL(file));
		},
	};

	player.load = (type, src) => {
		loadByType[type]?.(src);
	};

	player.empty = (type) => {
		const key = EMPTY_MESSAGE_KEYS[type];
		if (!key) return;
		return i18n.t(key);
	};

	player.refresh = refresh;

	player.syncFromTime = (sec) => {
		const hit = sheet.timeSearch(parseInt(sec * 1000));
		const { timeline, index, visible } = hit;

		if (timeline && !timeline.endtime) {
			timeline.end = (index + 1) <= sheet.lastIndex
				? sheet.timelines[index + 1].start
				: player.interface.duration() * 1000;
			timeline.endtime = formatTimecode(timeline.end);
		}

		player.subtitle.classList.toggle('visible', Boolean(visible));
		if (!timeline || sheet.focus == index) return;

		sheet.focus = index;
		const panel = toElement(sheet.panel);
		if (panel) {
			panel.querySelectorAll('.focus').forEach((row) => row.classList.remove('focus'));
			panel.querySelector(`.row-${index}`)?.classList.add('focus');
		}
		player.subtitle.querySelector('.current-text').innerHTML = timeline.text;
		player.subtitle.querySelector('.current-line').textContent = index + 1;
		player.subtitle.querySelector('.current-start').textContent = timeline.starttime;
		player.subtitle.querySelector('.current-end').textContent = timeline.endtime;
	};

	return player;
};

export { createPlayer };
