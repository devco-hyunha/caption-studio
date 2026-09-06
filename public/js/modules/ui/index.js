import { createToast } from './toast.js';
import { createFeedback } from './feedback.js';
import { createDialog } from './dialog.js';
import { createWidgets } from './widgets.js';
import { createApplyI18n } from './applyI18n.js';

/**
 * @typedef {Object} UiConfigureContext
 * @property {{ t: (key: string) => string, getLocale: (language?: string) => unknown }} i18n
 * @property {object} sheet
 * @property {object} video
 * @property {object} settings
 * @property {object} shortkey
 * @property {object} [import] - getter로 `subtitle.import` 지연 조회
 * @property {object} [export] - getter로 `subtitle.export` 지연 조회
 */

/**
 * UI 셸 모듈을 생성한다. `configure()` 호출 전까지 공개 API가 없다.
 *
 * @returns {object & { configure: (context: UiConfigureContext) => void, mount?: () => void }}
 */
const uiModule = () => {
	const ui = {};
	const toast = createToast();

	/**
	 * DOM 핸들과 UI API를 주입한다.
	 * `i18n`·`sheet`는 UI 조립에 쓰고, 동일 context를 data-action용으로 위젯에 전달한다.
	 * (`import`/`export` getter는 destructure하지 않고 context 참조를 유지한다)
	 *
	 * @param {UiConfigureContext} context
	 */
	ui.configure = (context) => {
		const { i18n, sheet } = context;

		ui.wrap = document.querySelector('#wrap');
		ui.layout = document.querySelector('#layout');

		const { alert, success, confirm } = createFeedback({ ui, i18n, toast });
		ui.alert = alert;
		ui.success = success;
		ui.confirm = confirm;

		const { switchFocus, dialog } = createDialog({ ui, sheet });
		ui.switchFocus = switchFocus;
		ui.dialog = { open: dialog.open, close: dialog.close };

		const { tab, select, inputFile } = createWidgets(context);
		ui.select = select.trigger;

		ui.applyI18n = createApplyI18n({ i18n });

		/**
		 * 위젯·다이얼로그 DOM 바인딩을 한 번에 수행한다.
		 * `configure` 이후 ready 시점에 1회 호출한다.
		 */
		ui.mount = () => {
			tab();
			inputFile();
			dialog.init();
			select.init();
		};
	};

	return ui;
};

export default uiModule;
