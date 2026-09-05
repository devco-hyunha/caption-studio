import { bindEvent } from '../utils/dom.js';

/**
 * @typedef {Object} DialogDeps
 * @property {object} ui - UI 셸 (layout · layer · anotherInput)
 * @property {() => object} getSheet - switchFocus 복원용 sheet
 */

/**
 * dialog · switchFocus API를 생성한다.
 *
 * @param {DialogDeps} deps
 * @returns {{
 *   switchFocus: (focusAnotherInput?: boolean) => void,
 *   dialog: {
 *     init: () => void,
 *     open: (dialogId: string) => void,
 *     close: () => void,
 *   },
 * }}
 */
const createDialog = ({ ui, getSheet }) => {
	const switchFocus = (focusAnotherInput) => {
		if (!ui.anotherInput) {
			const anotherInput = document.createElement('input');
			anotherInput.readOnly = true;
			anotherInput.className = 'another-input';
			document.body.appendChild(anotherInput);
			ui.anotherInput = anotherInput;
		}
		if (focusAnotherInput) {
			ui.anotherInput.focus();
			return;
		}
		const sheet = getSheet();
		sheet.active && sheet.active.target.indexOf('time') == -1 && sheet.trigger.input?.focus();
	};

	const close = () => {
		const layout = ui.layout;
		if (!layout) return;

		layout.classList.remove('on');
		const activeDialog = layout.querySelector('.dialog.on');
		if (activeDialog) {
			activeDialog.querySelector('.ui-tab .tab-header > li > a')?.click();
			activeDialog.classList.remove('on');
		}
		ui.layer = false;
	};

	const open = (dialogId) => {
		const layout = ui.layout;
		if (!layout || !dialogId) return;

		if (layout.classList.contains('on')) {
			ui.layer = false;
			layout.querySelectorAll('.dialog.on').forEach((openDialog) => {
				openDialog.classList.remove('on');
			});
		} else {
			ui.layer = true;
			layout.classList.add('on');
		}

		const dialog = layout.querySelector(`#${dialogId}`);
		if (!dialog) return;

		const tabHeader = dialog.querySelector('.tab-header');
		if (tabHeader) {
			const firstTabLink = tabHeader.querySelector(':scope > li > a');
			firstTabLink?.click();
		}
		dialog.classList.add('on');
		dialog.querySelector('input')?.focus();
		switchFocus(true);
	};

	const init = () => {
		const layout = ui.layout;
		if (!layout) return;

		document.querySelectorAll('.dialog-trigger').forEach((trigger) => {
			bindEvent({
				target: trigger,
				event: 'click',
				handler: () => {
					open(trigger.dataset.target);
					document.querySelectorAll('.nav-open').forEach((navOpen) => {
						navOpen.classList.remove('nav-open');
					});
				},
			});
		});

		const closeTargets = [
			...layout.querySelectorAll('.btn-close'),
			...document.querySelectorAll('.overlay'),
		];
		closeTargets.forEach((closeTarget) => {
			bindEvent({
				target: closeTarget,
				event: 'click',
				handler: close,
			});
		});
		close();
		switchFocus();
	};

	return {
		switchFocus,
		dialog: { init, open, close },
	};
};

export { createDialog };
