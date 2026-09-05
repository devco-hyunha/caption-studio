import { bindEvent } from '../../utils/dom.js';

/**
 * jQuery UI slider와 같은 마크업(`.ui-slider-handle` / `.ui-slider-range`)을 쓰는 바닐라 슬라이더.
 *
 * @param {HTMLElement} el
 * @param {{ min: number, max: number, step: number, value?: number, onSlide: (value: number) => void }} options
 * @returns {{ setValue: (value: number) => void }}
 */
const mountRangeSlider = (el, { min, max, step, value = 0, onSlide }) => {
	el.classList.add('ui-slider', 'ui-slider-horizontal');
	el.innerHTML = '';

	const range = document.createElement('div');
	range.className = 'ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min';
	const handle = document.createElement('div');
	handle.className = 'ui-slider-handle ui-state-default ui-corner-all';
	handle.tabIndex = 0;
	el.append(range, handle);

	const ratioOf = (val) => {
		if (max === min) return 0;
		return Math.max(0, Math.min(1, (val - min) / (max - min)));
	};

	const paint = (val) => {
		const percent = `${ratioOf(val) * 100}%`;
		handle.style.left = percent;
		range.style.width = percent;
	};

	const clamp = (val) => {
		const stepped = Math.round((val - min) / step) * step + min;
		return Math.max(min, Math.min(max, stepped));
	};

	const setValue = (val, emit = false) => {
		const next = clamp(val);
		paint(next);
		if (emit) onSlide(next);
	};

	const valueFromClientX = (clientX) => {
		const rect = el.getBoundingClientRect();
		const ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
		return clamp(min + ratio * (max - min));
	};

	const startDrag = (event) => {
		event.preventDefault();
		handle.classList.add('ui-state-active');
		const move = (moveEvent) => {
			const clientX = moveEvent.touches?.[0]?.clientX ?? moveEvent.clientX;
			setValue(valueFromClientX(clientX), true);
		};
		const stop = () => {
			handle.classList.remove('ui-state-active');
			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseup', stop);
			document.removeEventListener('touchmove', move);
			document.removeEventListener('touchend', stop);
		};
		document.addEventListener('mousemove', move);
		document.addEventListener('mouseup', stop);
		document.addEventListener('touchmove', move, { passive: false });
		document.addEventListener('touchend', stop);
		const clientX = event.touches?.[0]?.clientX ?? event.clientX;
		setValue(valueFromClientX(clientX), true);
	};

	bindEvent({ target: el, event: 'mousedown', handler: startDrag });
	bindEvent({ target: el, event: 'touchstart', handler: startDrag });
	setValue(value, false);

	return { setValue: (val) => setValue(val, false) };
};

export { mountRangeSlider };
