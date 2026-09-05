import { storage } from '../utils/index.js';
import { bindEvent } from '../utils/dom.js';

/**
 * 시트 점프 시간 설정.
 *
 * @param {{ sheet: object, i18n: { t: (key: string) => string }, ui: { Alert: Function, Success: Function } }} deps
 * @returns {object}
 */
const createConfig = ({ sheet, i18n, ui }) => {
	const config = {
		jump: 30,
		inputJump: document.querySelector('#jump_time_config_value'),
	};

	const setInputJumpEditable = (editable) => {
		if (!config.inputJump) return;
		config.inputJump.disabled = !editable;
		config.inputJump.readOnly = !editable;
	};

	const syncJumpLabels = () => {
		document.querySelectorAll('#time-plus strong, #time-minus strong').forEach((node) => {
			node.textContent = String(config.jump);
		});
		if (config.inputJump) config.inputJump.value = String(config.jump);
	};

	config.setJump = () => {
		const jump = storage.get('jump_val');
		if (jump) config.jump = Number.parseInt(jump, 10);
		syncJumpLabels();
	};

	config.init = () => {
		config.setJump();

		const changeBtn = document.querySelector('#jump_time_change');
		if (changeBtn) {
			bindEvent({
				target: changeBtn,
				event: 'click.sheet-config',
				handler: (event) => {
					event.preventDefault();
					if (changeBtn.classList.contains('on')) return;
					changeBtn.classList.add('on');
					const label = changeBtn.firstElementChild ?? changeBtn;
					label.textContent = i18n.t('save');
					setInputJumpEditable(true);
					config.inputJump?.focus();
					sheet.edit.cmd('selectAll');
				},
			});
		}

		const form = document.querySelector('.subtitle-move-time');
		if (form) {
			bindEvent({
				target: form,
				event: 'submit.sheet-config',
				handler: (event) => {
					event.preventDefault();
					const jump = (config.inputJump?.value ?? '').trim();
					if (jump === '') {
						ui.alert(i18n.t('please-input-move-time'));
						return;
					}
					const parsedJump = Number(jump);
					if (Number.isNaN(parsedJump) || parsedJump <= 0 || parsedJump > 1000) {
						ui.alert(i18n.t('input-move-time-error'));
						return;
					}
					changeBtn?.classList.remove('on');
					const label = changeBtn?.firstElementChild ?? changeBtn;
					if (label) label.textContent = i18n.t('change');
					storage.set('jump_val', jump);
					ui.success(i18n.t('config-saved'));
					config.setJump();
					setInputJumpEditable(false);
				},
			});
		}
	};

	return config;
};

export { createConfig };
