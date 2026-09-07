import { bindEvent } from '../../utils/dom.js';
import { migrateLanguage } from '../../i18n/migrateLanguage.js';
import { localeToSmiClassKey, SMI_CLASS_META } from './build/constants.js';

/**
 * 내려받기 다이얼로그의 시트 선택·SMI 메타 편집을 만든다.
 *
 * interim: Class/Name/lang은 UI locale → KRCC/ENCC/JPCC 프리셋.
 *
 * @param {{ sheet: object, i18n: { t: Function, getLanguage: () => string } }} deps
 */
const createExportSheetPicker = ({ sheet, i18n }) => {
	let selectedIndex = 0;
	let bound = false;

	const getPicker = () => document.querySelector('#subtitle-export .export-sheet-picker');
	const getSmiForm = () => document.querySelector('#subtitle-export-smi');

	const getSelectedDoc = () => {
		const docs = sheet.sheets ?? [];
		if (!docs.length) return null;
		if (selectedIndex < 0 || selectedIndex >= docs.length) selectedIndex = 0;
		return docs[selectedIndex];
	};

	const getSelectedTimelines = () => getSelectedDoc()?.timelines ?? sheet.timelines;

	const resolveLocalePreset = () => {
		const classKey = localeToSmiClassKey(migrateLanguage(i18n.getLanguage()));
		const meta = SMI_CLASS_META[classKey] ?? SMI_CLASS_META.KRCC;
		return { classKey, name: meta.name, lang: meta.lang };
	};

	const readSmiMetaFromForm = () => {
		const form = getSmiForm();
		const doc = getSelectedDoc();
		if (!form || !doc) return;
		const preset = resolveLocalePreset();
		const name = form.querySelector('[name="smi_name"]')?.value?.trim() ?? '';
		const lang = form.querySelector('[name="smi_lang"]')?.value?.trim() ?? '';
		doc.smiName = name || preset.name;
		doc.smiLang = lang || preset.lang;
		sheet.autoSave?.();
	};

	const fillSmiMeta = () => {
		const form = getSmiForm();
		const doc = getSelectedDoc();
		if (!doc || !form) return;
		const preset = resolveLocalePreset();
		const classField = form.querySelector('[name="smi_class"]');
		const classDisplay = form.querySelector('[name="smi_class_display"]');
		const nameField = form.querySelector('[name="smi_name"]');
		const langField = form.querySelector('[name="smi_lang"]');
		if (classField) classField.value = preset.classKey;
		if (classDisplay) classDisplay.value = preset.classKey;
		if (nameField) nameField.value = preset.name;
		if (langField) langField.value = preset.lang;
	};

	const render = () => {
		const picker = getPicker();
		if (!picker) return;
		const docs = sheet.sheets ?? [];
		if (!docs.length) {
			picker.innerHTML = '';
			return;
		}
		if (selectedIndex >= docs.length) selectedIndex = sheet.activeSheetIndex ?? 0;
		picker.innerHTML = docs.map((doc, index) => {
			const isActive = index === selectedIndex;
			return `<button type="button" class="export-sheet-btn${isActive ? ' is-active' : ''}" data-index="${index}" role="tab" aria-selected="${isActive}" tabindex="0">${doc.name}</button>`;
		}).join('');
	};

	const select = (index) => {
		const docs = sheet.sheets ?? [];
		if (index < 0 || index >= docs.length) return;
		if (index === selectedIndex) {
			fillSmiMeta();
			return;
		}
		readSmiMetaFromForm();
		selectedIndex = index;
		render();
		fillSmiMeta();
	};

	const open = () => {
		sheet.tabs?.persistActiveView?.();
		const dialog = document.querySelector('#subtitle-export');
		const docs = sheet.sheets ?? [];
		const isDialogOpen = dialog?.classList.contains('on');
		if (!isDialogOpen || selectedIndex < 0 || selectedIndex >= docs.length) {
			selectedIndex = sheet.activeSheetIndex ?? 0;
		}
		render();
		fillSmiMeta();
		bindOnce();
	};

	const bindOnce = () => {
		if (bound) return;
		const dialog = document.querySelector('#subtitle-export');
		const picker = getPicker();
		const form = getSmiForm();
		if (!dialog || !picker) return;
		bound = true;

		bindEvent({
			target: picker,
			event: 'click',
			selector: '.export-sheet-btn',
			handler: (event, matched) => {
				event.preventDefault();
				select(Number(matched.dataset.index));
			},
		});

		if (form) {
			bindEvent({
				target: form,
				event: 'change',
				selector: '[name="smi_name"], [name="smi_lang"]',
				handler: () => readSmiMetaFromForm(),
			});
			bindEvent({
				target: form,
				event: 'focusout',
				selector: '[name="smi_name"], [name="smi_lang"]',
				handler: () => readSmiMetaFromForm(),
			});
		}
	};

	return {
		open,
		render,
		select,
		getSelectedDoc,
		getSelectedTimelines,
		readSmiMetaFromForm,
		fillSmiMeta,
		get selectedIndex() {
			return selectedIndex;
		},
	};
};

export { createExportSheetPicker };
