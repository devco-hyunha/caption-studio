/**
 * Eyecon-style flat color picker (vanilla).
 * CSS class names match legacy `.colorpicker_*` markup.
 */

const SIZE = 255;

const TEMPLATE = `
<div class="colorpicker">
	<div class="colorpicker_color"><div><div></div></div></div>
	<div class="colorpicker_hue"><div></div></div>
	<div class="colorpicker_new_color"></div>
	<div class="colorpicker_current_color"></div>
	<div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div>
	<div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div>
	<div class="colorpicker_submit"><span class="i18n" data-text="color-apply"></span></div>
</div>`.trim();

const fixHsb = (hsb) => ({
	h: Math.min(360, Math.max(0, hsb.h)),
	s: Math.min(100, Math.max(0, hsb.s)),
	b: Math.min(100, Math.max(0, hsb.b)),
});

const fixRgb = (rgb) => ({
	r: Math.min(255, Math.max(0, rgb.r)),
	g: Math.min(255, Math.max(0, rgb.g)),
	b: Math.min(255, Math.max(0, rgb.b)),
});

const fixHex = (hex) => hex.padStart(6, '0');

const hexToRgb = (hex) => {
	const value = parseInt(hex.includes('#') ? hex.slice(1) : hex, 16);
	return {
		r: value >> 16,
		g: (65280 & value) >> 8,
		b: 255 & value,
	};
};

const rgbToHsb = (rgb) => {
	const hsb = { h: 0, s: 0, b: 0 };
	const min = Math.min(rgb.r, rgb.g, rgb.b);
	const max = Math.max(rgb.r, rgb.g, rgb.b);
	const delta = max - min;
	hsb.b = max;
	hsb.s = max !== 0 ? (255 * delta) / max : 0;
	if (hsb.s !== 0) {
		if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
		else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
		else hsb.h = 4 + (rgb.r - rgb.g) / delta;
	} else {
		hsb.h = -1;
	}
	hsb.h *= 60;
	if (rgb.r === rgb.g && rgb.g === rgb.b) hsb.h = 360;
	else if (hsb.h < 0) hsb.h += 360;
	hsb.s *= 100 / 255;
	hsb.b *= 100 / 255;
	return hsb;
};

const hexToHsb = (hex) => rgbToHsb(hexToRgb(hex));

const hsbToRgb = (hsb) => {
	let rgb = {};
	let h = Math.round(hsb.h);
	const s = Math.round((255 * hsb.s) / 100);
	const v = Math.round((255 * hsb.b) / 100);
	if (s === 0) {
		rgb.r = rgb.g = rgb.b = v;
	} else {
		const t1 = v;
		const t2 = ((255 - s) * v) / 255;
		const t3 = ((t1 - t2) * (h % 60)) / 60;
		if (h === 360) h = 0;
		if (h < 60) rgb = { r: t1, b: t2, g: t2 + t3 };
		else if (h < 120) rgb = { g: t1, b: t2, r: t1 - t3 };
		else if (h < 180) rgb = { g: t1, r: t2, b: t2 + t3 };
		else if (h < 240) rgb = { b: t1, r: t2, g: t1 - t3 };
		else if (h < 300) rgb = { b: t1, g: t2, r: t2 + t3 };
		else if (h < 360) rgb = { r: t1, g: t2, b: t1 - t3 };
		else rgb = { r: 0, g: 0, b: 0 };
	}
	return {
		r: Math.round(rgb.r),
		g: Math.round(rgb.g),
		b: Math.round(rgb.b),
	};
};

const rgbToHex = (rgb) =>
	[rgb.r, rgb.g, rgb.b].map((n) => n.toString(16).padStart(2, '0')).join('');

const hsbToHex = (hsb) => rgbToHex(hsbToRgb(hsb));

const parseColor = (color) => {
	if (typeof color === 'string') return hexToHsb(color.replace(/^#/, ''));
	if (color?.r != null && color?.g != null && color?.b != null) return rgbToHsb(color);
	if (color?.h != null && color?.s != null && color?.b != null) return fixHsb(color);
	return null;
};

const pointerPage = (event) => {
	const touch = event.touches?.[0] || event.changedTouches?.[0];
	if (touch) return { pageX: touch.pageX, pageY: touch.pageY };
	return { pageX: event.pageX, pageY: event.pageY };
};

/**
 * 마우스·터치 드래그를 동일하게 바인딩한다 (`rangeSlider`와 같은 패턴).
 *
 * @param {HTMLElement} el
 * @param {{
 *   onStart?: (event: Event) => boolean | void,
 *   onMove?: (event: Event) => void,
 *   onEnd?: (event: Event) => void,
 * }} handlers - `onStart`가 `false`를 반환하면 드래그를 시작하지 않는다
 */
const bindPointerDrag = (el, { onStart, onMove, onEnd } = {}) => {
	if (!el) return;

	const handleStart = (event) => {
		if (event.touches && event.touches.length > 1) return;
		if (event.cancelable) event.preventDefault();
		if (onStart?.(event) === false) return;

		const handleMove = (moveEvent) => {
			if (moveEvent.cancelable) moveEvent.preventDefault();
			onMove?.(moveEvent);
		};
		const handleEnd = (endEvent) => {
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('mouseup', handleEnd);
			document.removeEventListener('touchmove', handleMove);
			document.removeEventListener('touchend', handleEnd);
			document.removeEventListener('touchcancel', handleEnd);
			onEnd?.(endEvent);
		};

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchmove', handleMove, { passive: false });
		document.addEventListener('touchend', handleEnd);
		document.addEventListener('touchcancel', handleEnd);
	};

	el.addEventListener('mousedown', handleStart);
	el.addEventListener('touchstart', handleStart, { passive: false });
};

/**
 * @param {HTMLElement} host - `.picker` container
 * @param {{ color?: string }} [options]
 * @returns {{ host: HTMLElement, root: HTMLElement, setColor: Function, onSubmit: Function }}
 */
const createColorPicker = (host, options = {}) => {
	if (!host) return null;
	if (host.dataset.colorpickerId) {
		return host._colorPickerApi ?? null;
	}

	const initial = parseColor(options.color || 'ffffff') || { h: 0, s: 0, b: 100 };
	const id = `colorpicker_${Math.floor(Math.random() * 1000)}`;
	host.dataset.colorpickerId = id;

	const root = document.createElement('div');
	root.innerHTML = TEMPLATE;
	const cal = root.firstElementChild;
	cal.id = id;
	cal.style.position = 'relative';
	cal.style.display = 'block';
	host.appendChild(cal);

	const fields = [...cal.querySelectorAll('input')];
	const selector = cal.querySelector('.colorpicker_color');
	const selectorOverlay = selector?.firstElementChild;
	const selectorIndic = selectorOverlay?.firstElementChild;
	const hueStrip = cal.querySelector('.colorpicker_hue');
	const hueIndic = hueStrip?.firstElementChild;
	const newColor = cal.querySelector('.colorpicker_new_color');
	const currentColor = cal.querySelector('.colorpicker_current_color');
	const submitBtn = cal.querySelector('.colorpicker_submit');

	const state = {
		color: { ...initial },
		origColor: { ...initial },
		livePreview: true,
		onSubmit: null,
		keyCharMin: 65,
		host,
	};

	const fillFields = (hsb) => {
		if (isNaN(hsb.h)) hsb.h = 360;
		const rgbValue = hsbToRgb(hsb);
		fields[0].value = hsbToHex(hsb);
		fields[1].value = String(rgbValue.r);
		fields[2].value = String(rgbValue.g);
		fields[3].value = String(rgbValue.b);
		fields[4].value = String(Math.round(hsb.h));
		fields[5].value = String(Math.round(hsb.s));
		fields[6].value = String(Math.round(hsb.b));
	};

	const paint = (hsb) => {
		if (!selector || !selectorIndic || !hueIndic) return;
		const pure = `#${hsbToHex({ h: hsb.h, s: 100, b: 100 })}`;
		selector.style.backgroundColor = pure;
		selectorIndic.style.left = `${parseInt((SIZE * hsb.s) / 100, 10)}px`;
		selectorIndic.style.top = `${parseInt((SIZE * (100 - hsb.b)) / 100, 10)}px`;
		selectorIndic.style.backgroundColor = `#${hsbToHex(hsb)}`;
		hueIndic.style.top = `${parseInt(SIZE - (SIZE * hsb.h) / 360, 10)}px`;
		hueIndic.style.backgroundColor = pure;
		newColor.style.backgroundColor = `#${hsbToHex(hsb)}`;
		currentColor.style.backgroundColor = `#${hsbToHex(state.origColor)}`;
	};

	const applyColor = (hsb, syncFields = true) => {
		state.color = fixHsb(hsb);
		if (syncFields) fillFields(state.color);
		paint(state.color);
	};

	const readColorFromField = (input) => {
		const parentClass = input.parentElement?.className || '';
		if (parentClass.includes('_hex')) return hexToHsb(fixHex(input.value));
		if (parentClass.includes('_hsb')) {
			return fixHsb({
				h: parseInt(fields[4].value, 10) || 0,
				s: parseInt(fields[5].value, 10) || 0,
				b: parseInt(fields[6].value, 10) || 0,
			});
		}
		return rgbToHsb(
			fixRgb({
				r: parseInt(fields[1].value, 10) || 0,
				g: parseInt(fields[2].value, 10) || 0,
				b: parseInt(fields[3].value, 10) || 0,
			}),
		);
	};

	const handleFieldChange = (input, syncAll = true) => {
		applyColor(readColorFromField(input), syncAll);
	};

	fields.forEach((input) => {
		input.addEventListener('keyup', (event) => {
			const key = event.charCode || event.keyCode || -1;
			if ((key > state.keyCharMin && key <= 90) || key === 32) {
				event.preventDefault();
				return;
			}
			if (state.livePreview) handleFieldChange(input, false);
		});
		input.addEventListener('change', () => handleFieldChange(input, true));
		input.addEventListener('blur', () => {
			fields.forEach((field) => field.parentElement?.classList.remove('colorpicker_focus'));
		});
		input.addEventListener('focus', () => {
			state.keyCharMin = input.parentElement?.className.includes('_hex') ? 70 : 65;
			fields.forEach((field) => field.parentElement?.classList.remove('colorpicker_focus'));
			input.parentElement?.classList.add('colorpicker_focus');
			setTimeout(() => input.select(), 0);
		});
	});

	cal.querySelectorAll('.colorpicker_field > span').forEach((span) => {
		let field = null;
		let max = 255;
		let startY = 0;
		let startVal = 0;

		bindPointerDrag(span, {
			onStart: (event) => {
				field = span.parentElement?.querySelector('input') ?? null;
				if (!field) return false;
				field.focus();
				const parentClass = span.parentElement.className;
				max = parentClass.includes('_hsb_h') ? 360 : parentClass.includes('_hsb') ? 100 : 255;
				startY = pointerPage(event).pageY;
				startVal = parseInt(field.value, 10) || 0;
				span.parentElement.classList.add('colorpicker_slider');
			},
			onMove: (moveEvent) => {
				if (!field) return;
				const { pageY } = pointerPage(moveEvent);
				field.value = String(Math.max(0, Math.min(max, startVal + pageY - startY)));
				if (state.livePreview) handleFieldChange(field, true);
			},
			onEnd: () => {
				if (!field) return;
				handleFieldChange(field, true);
				span.parentElement.classList.remove('colorpicker_slider');
				field.focus();
			},
		});
	});

	const updateHueFromPointer = (event) => {
		const { pageY } = pointerPage(event);
		const top = hueStrip.getBoundingClientRect().top + window.scrollY;
		const h = parseInt((360 * (SIZE - Math.max(0, Math.min(SIZE, pageY - top)))) / SIZE, 10);
		fields[4].value = String(h);
		handleFieldChange(fields[4], true);
	};

	bindPointerDrag(hueStrip, {
		onStart: updateHueFromPointer,
		onMove: updateHueFromPointer,
	});

	const updateSelectorFromPointer = (event) => {
		const { pageX, pageY } = pointerPage(event);
		const rect = selector.getBoundingClientRect();
		const left = rect.left + window.scrollX;
		const top = rect.top + window.scrollY;
		const s = parseInt((100 * Math.max(0, Math.min(SIZE, pageX - left))) / SIZE, 10);
		const b = parseInt((100 * (SIZE - Math.max(0, Math.min(SIZE, pageY - top)))) / SIZE, 10);
		fields[5].value = String(s);
		fields[6].value = String(b);
		handleFieldChange(fields[6], true);
	};

	bindPointerDrag(selector, {
		onStart: updateSelectorFromPointer,
		onMove: updateSelectorFromPointer,
	});

	currentColor.addEventListener('click', () => {
		applyColor({ ...state.origColor }, true);
	});

	submitBtn.addEventListener('mouseenter', () => submitBtn.classList.add('colorpicker_focus'));
	submitBtn.addEventListener('mouseleave', () => submitBtn.classList.remove('colorpicker_focus'));
	submitBtn.addEventListener('click', () => {
		state.origColor = { ...state.color };
		currentColor.style.backgroundColor = `#${hsbToHex(state.origColor)}`;
		if (typeof state.onSubmit === 'function') {
			state.onSubmit(state.color, hsbToHex(state.color), hsbToRgb(state.color), host);
		}
	});

	applyColor(state.color, true);

	const api = {
		host,
		root: cal,
		setColor: (color) => {
			const parsed = parseColor(color);
			if (!parsed) return api;
			state.color = { ...parsed };
			state.origColor = { ...parsed };
			applyColor(state.color, true);
			return api;
		},
		onSubmit: (callback) => {
			state.onSubmit = callback;
			return api;
		},
	};

	host._colorPickerApi = api;
	return api;
};

export { createColorPicker };
