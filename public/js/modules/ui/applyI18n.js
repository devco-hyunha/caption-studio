/**
 * @typedef {Object} ApplyI18nDeps
 * @property {{ t: (key: string) => string, getLocale: (language?: string) => unknown }} i18n
 */

/**
 * DOM i18n 반영 함수(ui.applyI18n)를 생성한다.
 *
 * @param {ApplyI18nDeps} deps
 * @returns {() => void}
 */
const createApplyI18n = ({ i18n }) => () => {
	if (!i18n.getLocale()) return;

	document.querySelectorAll('.i18n').forEach((node) => {
		const { text, title, placeholder } = node.dataset;
		if (text != null) node.textContent = i18n.t(text);
		if (title != null) node.setAttribute('title', i18n.t(title));
		if (placeholder != null) node.setAttribute('placeholder', i18n.t(placeholder));
	});

	document.querySelectorAll('.ui-select').forEach((select) => {
		const value = select.dataset.value;
		if (!value) return;
		const option = select.querySelector(`.option [data-value="${value}"]`);
		const trigger = select.querySelector('.trigger');
		if (option && trigger) trigger.textContent = option.textContent;
	});
};

export { createApplyI18n };
