import { storage } from '../utils/storage.js';
import { normalizeMask } from './shortcuts.js';

/**
 * 단축키 설정 UI를 그리고 커스텀 키 변경 이벤트를 바인딩한다.
 * 라벨은 `.i18n[data-text]` + `ui.applyI18n()`으로 반영한다.
 *
 * @param {{
 *   shortkey: object,
 *   ui: object,
 *   i18n: { t: (key: string) => string },
 * }} deps
 * @returns {() => void}
 */
const createRenderSettings = ({ shortkey, ui, i18n }) => () => {
	const customList = document.querySelector('#custom-shortkey-list');
	const defaultList = document.querySelector('#default-shortkey-list');
	if (!customList || !defaultList) return;

	customList.replaceChildren();
	defaultList.replaceChildren();

	Object.entries(shortkey.customKeys).forEach(([keyId, keyEntry]) => {
		const maskLabel = keyEntry.mask.replace(/\+/gi, ' + ');
		customList.insertAdjacentHTML('beforeend', `
			<li>
				<form class="custom-shortkey" data-key="${keyId}">
					<dl>
						<dt>
							<span class="i18n" data-text="${keyEntry.placeholder}"></span>
							<button type="button" class="btn-change"><span class="i18n" data-text="change"></span></button>
							<button type="button" class="btn-cancel"><span class="i18n" data-text="cancel"></span></button>
						</dt>
						<dd><kbd>${maskLabel}</kbd><input type="text" class="i-text"/></dd>
					</dl>
				</form>
			</li>
		`);
	});

	shortkey.defaultKeys.forEach((keyEntry) => {
		if (!keyEntry.placeholder) return;
		const maskLabel = keyEntry.mask.replace(/\+/gi, ' + ');
		defaultList.insertAdjacentHTML('beforeend', `
			<li>
				<dl>
					<dt><span class="i18n" data-text="${keyEntry.placeholder}"></span></dt>
					<dd><kbd>${maskLabel}</kbd></dd>
				</dl>
			</li>
		`);
	});

	ui.applyI18n?.();

	customList.querySelectorAll('.custom-shortkey').forEach((form) => {
		const input = form.querySelector('.i-text');
		const keyId = form.dataset.key;

		form.querySelector('.btn-change')?.addEventListener('click', (event) => {
			event.preventDefault();
			if (!form.classList.contains('on')) {
				form.classList.add('on');
				input?.focus();
				return;
			}
			form.requestSubmit();
		});

		form.querySelector('.btn-cancel')?.addEventListener('click', (event) => {
			event.preventDefault();
			form.classList.remove('on');
		});

		input?.addEventListener('keydown', (event) => {
			event.preventDefault();
			const key = (event.key || '').toLowerCase();
			if (event.isComposing || key === 'process' || key === 'unidentified' || !event.code) {
				ui.alert(i18n.t('not-support-shortkey1'));
				input.value = '';
				return;
			}
			input.value = shortkey.convert(event);
		});

		form.addEventListener('submit', (event) => {
			event.preventDefault();
			const mask = normalizeMask(input?.value || '');
			if (mask === '') {
				ui.alert(i18n.t('please-input-shortkey'));
				input?.focus();
				return;
			}
			if (mask.length === 1) {
				ui.alert(i18n.t('not-support-shortkey2'));
				input?.focus();
				return;
			}
			if (shortkey.search(mask)) {
				shortkey.customKeys[keyId].mask = mask;
				storage.set(`customkey-${keyId}`, mask);
				shortkey.removeAll();
				shortkey.registerKeys();
				shortkey.renderSettings();
				ui.success(i18n.t('config-saved'));
				return;
			}
			ui.alert(i18n.t('duplecation-shortkey'));
			input?.focus();
		});
	});
};

export { createRenderSettings };
