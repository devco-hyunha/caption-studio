/**
 * 고정 단축키 목록을 생성한다. (설정 UI에서 변경 불가)
 *
 * @param {{ sheet: object, ui: object, video: object }} deps
 * @returns {object[]}
 */
const createDefaultKeys = ({ sheet, ui, video }) => {
	const { multiple, edit, move, undo, redo } = sheet;

	const createFormatHandler = (clipKey) => () => {
		if (multiple.state) {
			edit.multiClip(clipKey);
			return;
		}
		if (sheet.isTextTarget) {
			edit.clip(clipKey);
		}
	};

	const handleClear = () => {
		if (!multiple.state && sheet.isTextTarget && !edit.state) {
			edit.clip('clear');
		}
	};

	return [
		{
			placeholder: 'next-row-move', mask: 'tab', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer) {
					edit.state && edit.off();
					move.row.next(true);
				}
			},
		}, {
			placeholder: 'prev-row-move', mask: 'shift+tab', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer) {
					edit.state && edit.off();
					move.row.prev();
				}
			},
		}, {
			placeholder: 'sheet-edit-on', mask: 'f2', type: 'hold', preventDefault: true,
			handler: () => {
				if (!edit.state && !ui.layer && !multiple.state && sheet.isTextTarget) edit.on();
			},
		}, {
			placeholder: 'sheet-edit-off', mask: 'esc', type: 'hold', preventDefault: true,
			handler: () => {
				if (ui.layer) {
					ui.layout.querySelector('.overlay')?.click();
				} else if (multiple.state) {
					multiple.toggle();
				} else if (edit.state) {
					edit.off();
				}
			},
		}, {
			mask: 'enter', type: 'hold',
			handler: (e) => {
				if (ui.layer) {
					e.preventDefault();
					ui.layout.querySelector('.dialog.on .btn-submit')?.click();
				} else if (edit.state) {
					e.preventDefault();
					edit.cmd('enter');
				} else if (!multiple.state && sheet.isTextTarget) {
					edit.on();
				}
			},
		}, {
			mask: 'pageup', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer) {
					move.page.prev();
				}
			},
		}, {
			mask: 'pagedown', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer) {
					move.page.next();
				}
			},
		}, {
			mask: 'up', type: 'hold', preventDefault: true,
			handler: () => {
				sheet.shift = false;
				if (!ui.layer && !edit.state) {
					move.row.prev();
				}
			},
		}, {
			mask: 'down', type: 'hold', preventDefault: true,
			handler: () => {
				sheet.shift = false;
				if (!ui.layer && !edit.state) {
					move.row.next(false);
				}
			},
		}, {
			mask: 'left', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer && !edit.state) {
					move.col.prev();
				}
			},
		}, {
			mask: 'right', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer && !edit.state) {
					move.col.next();
				}
			},
		}, {
			mask: 'shift+up', type: 'hold', preventDefault: true,
			handler: () => {
				sheet.shift = true;
				if (!ui.layer && !edit.state) {
					move.row.prev();
				}
			},
		}, {
			mask: 'shift+down', type: 'hold', preventDefault: true,
			handler: () => {
				sheet.shift = true;
				if (!ui.layer && !edit.state) {
					move.row.next(false);
				}
			},
		}, {
			mask: 'space', type: 'hold', preventDefault: true,
			handler: () => {
				sheet.shift = false;
				if (multiple.state) {
					multiple.toggleRow(sheet.current.row);
				}
			},
		}, {
			placeholder: 'font-bold', mask: 'ctrl+b', type: 'down', preventDefault: true,
			handler: createFormatHandler('bold'),
		}, {
			placeholder: 'font-italic', mask: 'ctrl+i', type: 'down', preventDefault: true,
			handler: createFormatHandler('italic'),
		}, {
			placeholder: 'font-underline', mask: 'ctrl+u', type: 'down', preventDefault: true,
			handler: createFormatHandler('underline'),
		}, {
			placeholder: 'undo', mask: 'ctrl+z', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer && !edit.state) {
					undo();
				}
			},
		}, {
			placeholder: 'redo', mask: 'ctrl+y', type: 'hold', preventDefault: true,
			handler: () => {
				if (!ui.layer && !edit.state) {
					redo();
				}
			},
		}, {
			placeholder: 'volume-up', mask: 'ctrl+up', type: 'hold', preventDefault: true,
			handler: () => {
				try {
					video.volume(video.volume() + 0.1);
				} catch (error) {
					console.log(error);
				}
			},
		}, {
			placeholder: 'volume-down', mask: 'ctrl+down', type: 'hold', preventDefault: true,
			handler: () => {
				try {
					video.volume(video.volume() - 0.1);
				} catch (error) {
					console.log(error);
				}
			},
		}, {
			mask: 'backspace', type: 'hold', preventDefault: true,
			handler: handleClear,
		}, {
			mask: 'delete', type: 'hold', preventDefault: true,
			handler: handleClear,
		}, {
			placeholder: 'cut', mask: 'ctrl+x', type: 'down', preventDefault: true,
			handler: () => {
				if (!multiple.state && sheet.isTextTarget && !edit.state) {
					edit.clip();
				}
			},
		}, {
			placeholder: 'copy', mask: 'ctrl+c', type: 'down', preventDefault: true,
			handler: () => {
				if (!multiple.state && sheet.isTextTarget && !edit.state) {
					edit.clip();
				}
			},
		}, {
			placeholder: 'paste', mask: 'ctrl+v', type: 'down', preventDefault: true,
			handler: () => {
				if (!multiple.state && sheet.isTextTarget && !edit.state) {
					edit.clip();
				}
			},
		},
	];
};

export { createDefaultKeys };
