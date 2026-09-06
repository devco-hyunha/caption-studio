import { TEXT_TARGETS, TIME_TARGETS } from './targets.js';

/**
 * 사용자 변경 가능한 단축키 맵을 생성한다.
 *
 * @param {{ sheet: object, video: object }} deps
 * @returns {Record<string, object>}
 */
const createCustomKeys = ({ sheet, video }) => {
	const { multiple, edit, command, rowOffset } = sheet;
	const { currentTime, toggle } = video;

	const createColorHandler = (clipKey) => () => {
		if (multiple.state) {
			edit.multiClip(clipKey);
			return;
		}
		if (TEXT_TARGETS.includes(sheet.current.target)) {
			edit.clip(clipKey);
		}
	};

	const colorKeys = Object.fromEntries(
		Array.from({ length: 8 }, (_, index) => [`color${index}`, {
			placeholder: `color-${index + 1}`,
			mask: `ctrl+${index + 1}`,
			type: 'down',
			preventDefault: true,
			handler: createColorHandler(`color${index}`),
		}])
	);

	return {
		...colorKeys,
		colorClear: {
			placeholder: 'color-reset', mask: 'ctrl+9', type: 'down', preventDefault: true,
			handler: createColorHandler('color_clear'),
		},
		'sheet-insert': {
			placeholder: 'sheet-insert', mask: 'ctrl+shift+a', type: 'hold', preventDefault: true,
			handler: () => {
				!multiple.state && command.insert(sheet.current);
			},
		},
		'sheet-remove': {
			placeholder: 'sheet-remove', mask: 'ctrl+shift+d', type: 'hold', preventDefault: true,
			handler: () => {
				!multiple.state && command.remove(sheet.current);
			},
		},
		plus: {
			placeholder: 'time-plus', mask: 'ctrl+plus', type: 'hold', preventDefault: true,
			handler: () => {
				if (multiple.state) {
					edit.multiClip('plus');
				} else if (TIME_TARGETS.includes(sheet.current.target)) {
					edit.timePlus();
				}
			},
		},
		minus: {
			placeholder: 'time-minus', mask: 'ctrl+minus', type: 'hold', preventDefault: true,
			handler: () => {
				if (multiple.state) {
					edit.multiClip('minus');
				} else if (TIME_TARGETS.includes(sheet.current.target)) {
					edit.timeMinus();
				}
			},
		},
		carve: {
			placeholder: 'time-carve', mask: 'ctrl+`', type: 'down', preventDefault: true,
			handler: () => {
				if (!multiple.state) {
					document.querySelector('.vjs-selecttime-control')?.click();
				}
			},
		},
		sheetJump: {
			placeholder: 'move-current', mask: 'alt+q', type: 'down', preventDefault: true,
			handler: () => {
				if (!multiple.state && !isNaN(sheet.focus)) rowOffset(sheet.focus);
			},
		},
		videoJump: {
			placeholder: 'timeline-current', mask: 'ctrl+q', type: 'down', preventDefault: true,
			handler: () => {
				try {
					if (!multiple.state) {
						currentTime(sheet.timelines[sheet.current.row].start / 1000);
					}
				} catch (error) {
					document.querySelector('.video-import')?.click();
				}
			},
		},
		play: {
			placeholder: 'play-stop', mask: 'ctrl+space', type: 'hold', preventDefault: true,
			handler: () => {
				try {
					if (!multiple.state) {
						toggle();
					}
				} catch (error) {
					document.querySelector('.video-import')?.click();
				}
			},
		},
		prev: {
			placeholder: 'video-prev', mask: 'ctrl+left', type: 'hold', preventDefault: true,
			handler: () => {
				currentTime(currentTime() - 10);
			},
		},
		next: {
			placeholder: 'video-next', mask: 'ctrl+right', type: 'hold', preventDefault: true,
			handler: () => {
				currentTime(currentTime() + 10);
			},
		},
	};
};

export { createCustomKeys };
