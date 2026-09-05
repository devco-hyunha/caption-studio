import { bindEvent, toElement } from '../../utils/dom.js';
import { syncToolbar } from '../helpers/toolbarState.js';

/**
 * @param {unknown} col
 * @returns {number | null} offsetParent 기준 top (없으면 null)
 */
const resolveColTop = (col) => {
	const el = toElement(col);
	if (!el) return null;
	return el.offsetTop;
};

/**
 * 시트 셀 편집 오버레이(`.sheet-trigger`) API를 만든다.
 *
 * @param {object} sheet
 * @returns {{
 *   wrap: Element | null,
 *   input: Element | null,
 *   init: () => void,
 *   reset: () => void,
 *   autoFocus: () => void,
 *   focus: (col?: unknown) => void,
 *   setMinWidth: (minWidth: number) => void,
 * }}
 */
const createTrigger = (sheet) => {
	const trigger = {
		wrap: null,
		input: null,
	};

	let autoFocusTimer = null;

	/**
	 * `.sheet-trigger` · `.sheet-input`을 찾고 이벤트를 바인딩한다.
	 */
	const init = () => {
		if (!sheet.root) return;

		trigger.wrap = sheet.root.querySelector('.sheet-trigger');
		trigger.input = trigger.wrap?.querySelector('.sheet-input') ?? null;
		if (!trigger.input) return;

		bindEvent({
			target: trigger.input,
			event: 'keydown.sheet-trigger',
			handler: () => {
				if (sheet.current.target != 'text' && sheet.current.target != 'memo') {
					trigger.input.innerHTML = '';
				}
			},
		});
		bindEvent({
			target: trigger.input,
			event: 'click.sheet-trigger',
			handler: (event) => {
				event.preventDefault();
				event.stopPropagation();
				trigger.input.focus();
			},
		});
	};

	/**
	 * set 등으로 시트를 다시 로드할 때 편집 UI 상태를 비운다.
	 */
	const reset = () => {
		trigger.wrap?.classList.remove('on', 'clip');
		trigger.input?.classList.remove('multi-clip');
	};

	/**
	 * 트리거 wrap/input에 포커스를 맞춘다 (time 셀은 input 제외).
	 */
	const autoFocus = () => {
		clearTimeout(autoFocusTimer);
		autoFocusTimer = setTimeout(() => {
			trigger.wrap?.focus();
			if (sheet.active?.target?.indexOf('time') == -1) trigger.input?.focus();
		}, 0);
	};

	/**
	 * 현재 셀 위치로 트리거를 이동하고 내용을 채운다.
	 *
	 * @param {unknown} [col] - 기준 셀 Element 또는 jQuery 컬렉션
	 */
	const focus = (col) => {
		const colTop = resolveColTop(col);
		if (colTop != null) {
			sheet.offset = colTop - 1;
		} else {
			let offset = 0;
			const currentIndex = sheet.current.row;
			for (let index = 0; index < currentIndex; index++) {
				offset += sheet.rowInfo[index].height;
			}
			sheet.offset = offset - 1;
		}

		const height = sheet.rowInfo[sheet.current.row].height;
		let bottom = sheet.offset + height;

		if (sheet.scroll > sheet.offset) {
			sheet.needsRedraw = true;
			sheet.scroll = sheet.offset + 1;
			sheet.body.scrollTop = sheet.offset;
		} else if (sheet.scroll + sheet.canvas.height < bottom) {
			bottom = bottom - sheet.canvas.height + 1;
			sheet.needsRedraw = true;
			sheet.scroll = bottom;
			sheet.body.scrollTop = bottom;
		}

		if (trigger.wrap) {
			const left = sheet.move.left[sheet.format][sheet.current.col];
			trigger.wrap.style.left = typeof left === 'number' ? `${left}px` : left;
			trigger.wrap.style.top = `${sheet.offset}px`;
		}

		if (trigger.input) {
			trigger.input.innerHTML = `${sheet.current.data[sheet.current.target]}<br>`;
			const minWidth = sheet.getColWidth(sheet.current.target);
			if (minWidth != null) trigger.input.style.minWidth = `${minWidth}px`;
			trigger.input.style.minHeight = `${height + 1}px`;
		}

		autoFocus();

		if (!sheet.multiple?.state) syncToolbar(sheet.current.target);
	};

	/**
	 * @param {number} minWidth
	 */
	const setMinWidth = (minWidth) => {
		if (!trigger.input || minWidth == null) return;
		trigger.input.style.minWidth = `${minWidth}px`;
	};

	trigger.init = init;
	trigger.reset = reset;
	trigger.autoFocus = autoFocus;
	trigger.focus = focus;
	trigger.setMinWidth = setMinWidth;

	return trigger;
};

export { createTrigger };