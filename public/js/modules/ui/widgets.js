import { runAction } from '../utils/action.js';
import { trackEvent } from '../analytics/track.js';
import { bindEvent } from '../utils/dom.js';

/**
 * @typedef {Object} WidgetsDeps
 * @property {() => object} getActionContext - data-action용 지연 컨텍스트
 */

const getChildIndex = (node) => [...node.parentElement.children].indexOf(node);

const removeClassAll = (root, selector, className) => {
	root.querySelectorAll(selector).forEach((node) => {
		node.classList.remove(className);
	});
};

const resetFileFields = (root) => {
	root.querySelectorAll('.i-text.file').forEach((fileField) => {
		fileField.classList.add('empty');
		const filename = fileField.querySelector('.i-filename');
		if (filename) filename.textContent = '';
	});
};

const bindToggle = () => {
	document.querySelectorAll('.ui-toggle').forEach((toggle) => {
		bindEvent({
			target: toggle,
			event: 'click',
			selector: '.trigger',
			handler: (event) => {
				event.preventDefault();
				event.stopPropagation();
				toggle.classList.toggle('on');
			},
		});
	});
};

const createTab = (getActionContext) => () => {
	document.querySelectorAll('.ui-tab').forEach((tab) => {
		bindEvent({
			target: tab,
			event: 'click',
			selector: '.tab-header > li > a',
			handler: (event, tabLink) => {
				if (tab.classList.contains('form')) {
					tab.querySelector('.btn-reset')?.click();
					resetFileFields(tab);
				}

				removeClassAll(tab, '.tab-header > li.on', 'on');
				removeClassAll(tab, '.tab-panel.on', 'on');

				const activeItem = tabLink.parentElement;
				activeItem.classList.add('on');
				const activeIndex = getChildIndex(activeItem);
				tab.querySelectorAll('.tab-panel')[activeIndex]?.classList.add('on');

				const value = tabLink.dataset.value;
				const linkAction = tabLink.dataset.action;
				const tabAction = tab.dataset.action;
				if (value != null) tab.dataset.value = value;
				if (linkAction) runAction(linkAction, getActionContext(), value);
				if (tabAction) runAction(tabAction, getActionContext(), value);
			},
		});
		tab.querySelector('.tab-header > li > a')?.click();
	});
};

const createSelect = (getActionContext) => ({
	trigger: ({ key, value } = {}) => {
		const select = document.querySelector(`.ui-select[data-key="${key}"]`);
		if (!select) return;
		const optionLink = value
			? select.querySelector(`[data-value="${value}"]`)
			: select.querySelector('[data-value]');
		optionLink?.click();
	},
	init: () => {
		document.querySelectorAll('.ui-select').forEach((select) => {
			bindEvent({
				target: select,
				event: 'click',
				selector: '.trigger',
				handler: () => {
					select.classList.toggle('on');
				},
			});
			bindEvent({
				target: select,
				event: 'click',
				selector: '.option > li > a',
				handler: (event, optionLink) => {
					const optionItem = optionLink.parentElement;
					removeClassAll(optionItem.parentElement, ':scope > li', 'current');
					optionItem.classList.add('current');

					const value = optionLink.dataset.value;
					const trigger = select.querySelector('.trigger');
					if (trigger) trigger.textContent = optionLink.textContent;
					if (value != null) select.dataset.value = value;

					const selectAction = select.dataset.action;
					if (selectAction) runAction(selectAction, getActionContext(), value);
					select.classList.remove('on');
					trackEvent({
						category: 'Selection',
						action: `${select.dataset.key} : ${value}`,
						label: 'Selection',
					});
				},
			});
			bindEvent({
				target: select,
				event: 'mouseleave',
				handler: () => {
					select.classList.remove('on');
				},
			});
		});
		bindToggle();
	},
});

const createInputFile = (getActionContext) => () => {
	document.querySelectorAll('.i-text.file').forEach((fileField) => {
		const fileInput = fileField.querySelector('input[type="file"]');
		if (!fileInput) return;
		bindEvent({
			target: fileInput,
			event: 'change',
			handler: () => {
				const file = fileInput.files[0];
				const filename = fileField.querySelector('.i-filename');
				const fileAction = fileField.dataset.action;
				if (file) {
					fileField.classList.remove('empty');
					if (filename) filename.textContent = file.name;
				} else {
					fileField.classList.add('empty');
					if (filename) filename.textContent = '';
				}
				if (fileAction) runAction(fileAction, getActionContext(), fileField, file);
			},
		});
	});
};

/**
 * tab · select · inputFile 위젯 API를 생성한다.
 *
 * @param {WidgetsDeps} deps
 * @returns {{
 *   tab: () => void,
 *   select: { trigger: Function, init: Function },
 *   inputFile: () => void,
 * }}
 */
const createWidgets = ({ getActionContext }) => ({
	tab: createTab(getActionContext),
	select: createSelect(getActionContext),
	inputFile: createInputFile(getActionContext),
});

export { createWidgets };
