import { capitalize, padZero, splitTimecode, timePartsToMs } from '../../utils/index.js';
import { bindEvent } from '../../utils/dom.js';
import { mountRangeSlider } from './rangeSlider.js';

const datasetNumber = (el, key, fallback) => {
	const raw = el.dataset[key];
	const value = raw == null ? fallback : Number(raw);
	return Number.isFinite(value) ? value : fallback;
};

const readPartInputs = (timeParts) => ({
	hour: timeParts.querySelector('.hour > input')?.value,
	minute: timeParts.querySelector('.minute > input')?.value,
	second: timeParts.querySelector('.second > input')?.value,
	milli: timeParts.querySelector('.milli > input')?.value,
});

const closeLayoutOverlay = (ui) => {
	const overlay =
		ui?.Layout?.[0]?.querySelector?.('.overlay') ??
		document.querySelector('#layout .overlay');
	overlay?.click();
};

/**
 * 시간 편집기(`#time-editor`) UI 바인딩.
 *
 * @param {{ edit: object, sheet: object, ui: object }} deps
 * @returns {{ timeControl: () => void }}
 */
const createTimeControl = ({ edit, sheet, ui }) => ({
	timeControl: () => {
		const timeEditor = document.querySelector('#time-editor');
		if (!timeEditor) return;

		const timeParts = timeEditor.querySelector('.time-part');
		const timeSliders = timeEditor.querySelector('.time-slider');
		const milliSecond = timeEditor.querySelector('#millisecond');
		const timePositive = timeEditor.querySelector('.time-positive');
		const timeReset = timeEditor.querySelector('.btn-reset');
		const timeApply = timeEditor.querySelector('.time-apply');
		if (!timeParts || !timeSliders || !milliSecond || !timePositive || !timeReset || !timeApply) return;

		/** @type {Record<string, { setValue: (value: number) => void }>} */
		const sliders = {};

		timeSliders.querySelectorAll('.slider').forEach((sliderEl) => {
			const target = sliderEl.dataset.target;
			const min = datasetNumber(sliderEl, 'min', 0);
			const max = datasetNumber(sliderEl, 'max', 100);
			const step = datasetNumber(sliderEl, 'step', 1);
			sliders[target] = mountRangeSlider(sliderEl, {
				min,
				max,
				step,
				value: 0,
				onSlide: (value) => {
					const input = timeParts.querySelector(`.${target} > input`);
					if (!input) return;
					input.value = String(value);
					input.dispatchEvent(new Event('change', { bubbles: true }));
				},
			});
		});

		const syncMilliFromParts = (sign) => {
			const timeMs = timePartsToMs(readPartInputs(timeParts));
			let milli = Math.abs(timeMs.hour + timeMs.minute + timeMs.second + timeMs.milli);
			const positive =
				sign ??
				timePositive.querySelector('[name="time-positive"]:checked')?.value;
			if (positive === 'minus') milli *= -1;
			milliSecond.value = String(milli);
		};

		timePositive.querySelectorAll('input').forEach((input) => {
			bindEvent({
				target: input,
				event: 'click',
				handler: () => {
					syncMilliFromParts(input.value);
				},
			});
		});

		timeParts.querySelectorAll('.visible').forEach((visible) => {
			bindEvent({
				target: visible,
				event: 'click',
				handler: () => {
					visible.parentElement?.querySelector('input')?.focus();
				},
			});
		});

		const handlePartInput = (input) => {
			const max = datasetNumber(input, 'max', Infinity);
			const target = input.dataset.target;
			const zf = datasetNumber(input, 'zf', 2);
			let value = parseInt(input.value, 10);
			if (isNaN(value)) value = 0;
			if (value > max) {
				value = max;
				input.value = String(value);
			}

			if (target && sliders[target]) sliders[target].setValue(value);
			const visible = input.nextElementSibling;
			if (visible) visible.textContent = padZero(value, zf);
			syncMilliFromParts();
		};

		timeParts.querySelectorAll('input').forEach((input) => {
			['change', 'keydown', 'keyup'].forEach((type) => {
				bindEvent({
					target: input,
					event: type,
					handler: () => handlePartInput(input),
				});
			});
		});

		bindEvent({
			target: milliSecond,
			event: 'change',
			handler: () => {
				const max = datasetNumber(milliSecond, 'max', Infinity);
				const min = datasetNumber(milliSecond, 'min', -Infinity);
				let value = Number(milliSecond.value);
				if (isNaN(value)) value = 0;

				const minus = timePositive.querySelector('.minus');
				const plus = timePositive.querySelector('.plus');
				if (value < 0 && minus) minus.checked = true;
				else if (plus) plus.checked = true;

				if (value > max) {
					value = max;
					milliSecond.value = String(value);
				}
				if (value < min) {
					value = min;
					milliSecond.value = String(value);
				}

				value = Math.abs(value);
				const { hour, minute, second, milli } = splitTimecode(value);
				const hourInput = timeParts.querySelector('.hour > input');
				const minuteInput = timeParts.querySelector('.minute > input');
				const secondInput = timeParts.querySelector('.second > input');
				const milliInput = timeParts.querySelector('.milli > input');
				if (hourInput) {
					hourInput.value = String(hour);
					hourInput.dispatchEvent(new Event('change', { bubbles: true }));
				}
				if (minuteInput) {
					minuteInput.value = String(minute);
					minuteInput.dispatchEvent(new Event('change', { bubbles: true }));
				}
				if (secondInput) {
					secondInput.value = String(second);
					secondInput.dispatchEvent(new Event('change', { bubbles: true }));
				}
				if (milliInput) {
					milliInput.value = String(milli);
					milliInput.dispatchEvent(new Event('change', { bubbles: true }));
				}
			},
		});

		bindEvent({
			target: timeReset,
			event: 'click',
			handler: () => {
				timeParts.querySelectorAll('input').forEach((input) => {
					input.value = '0';
					input.dispatchEvent(new Event('change', { bubbles: true }));
				});
			},
		});

		bindEvent({
			target: timeApply,
			event: 'click',
			handler: (event) => {
				event.preventDefault();
				const positive = timePositive.querySelector('[name="time-positive"]:checked')?.value;
				const milli = Math.abs(Number(milliSecond.value));
				if (milli && positive) {
					if (!sheet.multiple.state) edit['time' + capitalize(positive)](milli);
					else edit.multiClip(positive, milli);
				}
				timeReset.click();
				closeLayoutOverlay(ui);
			},
		});
	},
});

export { createTimeControl };
