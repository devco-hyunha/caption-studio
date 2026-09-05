/**
 * @typedef {Object} FeedbackDeps
 * @property {object} ui - UI 셸 (`switchFocus` 등)
 * @property {{ t: (key: string) => string }} i18n
 * @property {(params: { type: string, message?: string, title?: string, options?: object }) => void} toast
 */

/**
 * @typedef {Object} ConfirmOptions
 * @property {string|false} [title]
 * @property {string|false} [content]
 * @property {string|false} [successLabel]
 * @property {string|false} [cancelLabel]
 * @property {boolean} [bgDismiss]
 * @property {Function|null} [success]
 * @property {Function|null} [cancel]
 */

const createElement = (tagName, className) => {
	const node = document.createElement(tagName);
	if (className) node.className = className;
	return node;
};

/**
 * alert / success / confirm 피드백 API를 생성한다.
 *
 * @param {FeedbackDeps} deps
 * @returns {{
 *   alert: (message: string) => void,
 *   success: (message: string) => void,
 *   confirm: (options?: ConfirmOptions) => void,
 * }}
 */
const createFeedback = ({ ui, i18n, toast }) => {
	const alert = (message) => {
		toast({ type: 'error', message });
	};

	const success = (message) => {
		toast({ type: 'success', message });
	};

	const confirm = (options) => {
		const defaultOptions = {
			title: false,
			content: false,
			successLabel: i18n.t('yes'),
			cancelLabel: i18n.t('no'),
			bgDismiss: false,
			success: null,
			cancel: null,
		};
		const mergedOptions = options && typeof options === 'object'
			? Object.assign({}, defaultOptions, options)
			: defaultOptions;

		const wrap = createElement('div', 'cf-wrap');
		const overlay = createElement('div', 'cf-overlay');
		const box = createElement('div', 'cf-box');
		wrap.appendChild(overlay);
		wrap.appendChild(box);

		if (mergedOptions.title) {
			const titleWrap = createElement('div', 'cf-title');
			const titleText = createElement('span', 'title');
			titleText.textContent = mergedOptions.title;
			titleWrap.appendChild(titleText);
			box.appendChild(titleWrap);
		}
		if (mergedOptions.content) {
			const contentBody = createElement('div', 'cf-content');
			contentBody.innerHTML = mergedOptions.content;
			box.appendChild(contentBody);
		}

		let successButton = null;
		let cancelButton = null;
		if (mergedOptions.successLabel || mergedOptions.cancelLabel) {
			const buttons = createElement('div', 'cf-btns');
			box.appendChild(buttons);
			if (mergedOptions.successLabel) {
				successButton = createElement('button', 'btn-success tup');
				successButton.textContent = mergedOptions.successLabel;
				buttons.appendChild(successButton);
			}
			if (mergedOptions.cancelLabel) {
				cancelButton = createElement('button', 'btn-cancel tup');
				cancelButton.textContent = mergedOptions.cancelLabel;
				buttons.appendChild(cancelButton);
			}
		}

		const close = (action) => {
			if (action && mergedOptions[action]) mergedOptions[action]();
			wrap.remove();
		};

		if (mergedOptions.bgDismiss) {
			overlay.addEventListener('click', () => {
				close();
			});
		}
		if (successButton) {
			successButton.addEventListener('click', () => {
				close('success');
			});
		}
		if (cancelButton) {
			cancelButton.addEventListener('click', () => {
				close('cancel');
			});
		}

		document.body.appendChild(wrap);
		ui.switchFocus(true);
	};

	return { alert, success, confirm };
};

export { createFeedback };
