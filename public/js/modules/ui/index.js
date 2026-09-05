import { createToast } from './toast.js';
import { createFeedback } from './feedback.js';
import { createDialog } from './dialog.js';
import { createWidgets } from './widgets.js';
import { createApplyI18n } from './applyI18n.js';

/**
 * @typedef {Object} UiInitDeps
 * @property {{ t: (key: string) => string, getLocale: (language?: string) => unknown }} i18n
 * @property {() => object} getSheet
 * @property {() => object} getActionContext
 */

/**
 * UI 셸 모듈을 생성한다. `initialize()` 호출 전까지 공개 API가 없다.
 *
 * @returns {object & { initialize: (deps: UiInitDeps) => void, init?: () => void }}
 */
const uiModule = () => {
	const ui = {};
	const toast = createToast();

	/**
	 * DOM 핸들과 UI API를 주입한다.
	 *
	 * @param {UiInitDeps} deps
	 */
	ui.initialize = ({ i18n, getSheet, getActionContext }) => {
		ui.wrap = document.querySelector('#wrap');
		ui.layout = document.querySelector('#layout');

		const { alert, success, confirm } = createFeedback({ ui, i18n, toast });
		ui.alert = alert;
		ui.success = success;
		ui.confirm = confirm;

		const { switchFocus, dialog } = createDialog({ ui, getSheet });
		ui.switchFocus = switchFocus;
		ui.dialog = { open: dialog.open, close: dialog.close };

		const { tab, select, inputFile } = createWidgets({ getActionContext });
		ui.select = select.trigger;

		ui.applyI18n = createApplyI18n({ i18n });

		/**
		 * 위젯·다이얼로그 DOM 바인딩을 한 번에 수행한다.
		 * `initialize` 이후 ready 시점에 1회 호출한다.
		 */
		ui.init = () => {
			tab();
			inputFile();
			dialog.init();
			select.init();
		};
	};

	return ui;
};

export default uiModule;
