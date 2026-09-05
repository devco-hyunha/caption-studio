import { storage } from '../../utils/index.js';
import { bindEvent } from '../../utils/dom.js';
import { createColorPicker } from './colorPicker.js';

/**
 * 색상 팔레트·피커 UI.
 * 피커는 바닐라 `colorPicker.js` (`createColorPicker`) 사용.
 *
 * @param {{ edit: object, sheet: object, ui: object }} deps
 * @returns {{ set: Function, event: Function, init: Function }}
 */
const createColor = ({ edit, sheet, ui }) => ({
	set: (colors) => {
		if (!edit.color.list) {
			edit.color.list = [
				'#ff0000',
				'#ff00ff',
				'#aa00ff',
				'#0000ff',
				'#00ffff',
				'#00ff00',
				'#ffff00',
				'#ffaa00',
			];
			colors = storage.get('CaptionColorTemp');
			if (colors && colors != '' && colors.length > 0) {
				colors.forEach((color, index) => {
					edit.color.list[index] = color;
				});
			}
		} else {
			storage.set('CaptionColorTemp', edit.color.list);
		}
		document.querySelectorAll('.color-list').forEach((colorList) => {
			const panels = colorList.querySelectorAll('.color-panel');
			edit.color.list.forEach((color, index) => {
				const panel = panels[index];
				if (!panel) return;
				const swatch = panel.querySelector('.color');
				const hex = panel.querySelector('.hex');
				if (swatch) {
					swatch.style.backgroundColor = color;
					swatch.setAttribute('title', color);
				}
				if (hex) hex.textContent = color;
			});
		});
	},

	event: () => {
		const dialog = ui.colorPicker?.host?.closest('.dialog');
		if (!dialog || !ui.colorPicker) return;

		bindEvent({
			target: dialog,
			event: 'click',
			selector: '.btn-color',
			handler: (event, btn) => {
				event.preventDefault();
				const parent = btn.parentElement;
				const eq = parent?.parentElement
					? Array.from(parent.parentElement.children).indexOf(parent)
					: -1;
				if (eq < 0) return;

				ui.colorPicker
					.setColor(edit.color.list[eq])
					.onSubmit((hsb, hex) => {
						edit.color.list[eq] = '#' + hex;
						edit.color.set(edit.color.list);
					});

				dialog.querySelectorAll('li.current').forEach((li) => li.classList.remove('current'));
				parent.classList.add('current');
			},
		});
	},

	init: () => {
		edit.color.set();
		edit.color.list.forEach((_, index) => {
			const command = 'color' + index;
			const btn = document.querySelector('#color-' + (index + 1));
			if (!btn) return;

			bindEvent({
				target: btn,
				event: 'click',
				handler: (event) => {
					event.preventDefault();
					if (btn.classList.contains('disabled')) return;
					if (sheet.multiple.state) {
						edit.multiClip(command);
						return;
					}
					if (sheet.current.target === 'text' || sheet.current.target === 'memo') {
						edit.clip(command);
					}
				},
			});
		});

		const pickerHost = document.querySelector('#color-selector .picker');
		ui.colorPicker = createColorPicker(pickerHost);
		edit.color.event();

		const colorSelect = document.querySelector('#color-select');
		if (colorSelect) {
			bindEvent({
				target: colorSelect,
				event: 'click',
				handler: (event) => {
					event.preventDefault();
					ui.Dialog('color-selector');
					document.querySelector('#color-selector .btn-color')?.click();
				},
			});
		}
	},
});

export { createColor };
