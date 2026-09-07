import { editHistory } from '../../utils/index.js';
import { clone } from '../../utils/object.js';
import { EMPTY_TIMELINE } from '../constants.js';
import {
	createUniqueSheetName,
	isValidTabName,
} from './names.js';
import { createEmptySheetDoc } from './normalizeTemp.js';

/**
 * 활성 시트의 뷰·히스토리를 문서에 저장한다.
 *
 * @param {object} sheet
 */
const persistActiveView = (sheet) => {
	const doc = sheet.sheets[sheet.activeSheetIndex];
	if (!doc) return;
	doc.timelines = sheet.timelines;
	doc.scroll = sheet.body?.scrollTop ?? sheet.scroll ?? 0;
	doc.current = { ...sheet.current };
	doc.selectedRows = [...(sheet.selectedRows ?? [])];
	doc.history = editHistory.getState();
};

/**
 * 문서의 뷰·히스토리를 시트 런타임에 복원한다.
 *
 * @param {object} sheet
 * @param {object} doc
 */
const restoreView = (sheet, doc) => {
	sheet.timelines = doc.timelines;
	sheet.current = doc.current && Object.keys(doc.current).length > 0
		? { ...doc.current }
		: {};
	sheet.selectedRows = [...(doc.selectedRows ?? [])];
	sheet.scroll = doc.scroll ?? 0;
	sheet.active = null;
	sheet.focus = null;
	sheet.shift = false;
	sheet.searchHits = [];
	editHistory.setState(doc.history ?? { entries: [], index: -1 });
};

/**
 * 탭 CRUD · 전환 API.
 *
 * @param {{ sheet: object, i18n: { t: (key: string) => string }, ui: { confirm: Function, alert: Function } }} deps
 */
const createTabs = ({ sheet, i18n, ui }) => {
	const renderFooter = () => {
		const footer = sheet.footer;
		if (!footer) return;

		const tabsHtml = sheet.sheets.map((doc, index) => {
			const isActive = index === sheet.activeSheetIndex;
			return `
				<div class="sheet-tab${isActive ? ' is-active' : ''}" data-index="${index}" role="tab" aria-selected="${isActive}" tabindex="0">
					<span class="sheet-tab-name" data-index="${index}">${doc.name}</span>
					<button type="button" class="sheet-tab-delete" data-index="${index}" aria-label="${i18n.t('sheet-tab-delete')}" title="${i18n.t('sheet-tab-delete')}">
						<i class="mt icon-close"></i>
					</button>
				</div>`;
		}).join('');

		footer.innerHTML = `
			<div class="sheet-tabs" role="tablist">${tabsHtml}</div>
			<button type="button" class="sheet-tab-add" aria-label="${i18n.t('sheet-tab-add')}" title="${i18n.t('sheet-tab-add')}">
				<i class="mt icon-add"></i>
			</button>`;
	};

	const applyActive = (index, { skipPersist } = {}) => {
		if (!skipPersist) persistActiveView(sheet);
		sheet.activeSheetIndex = index;
		restoreView(sheet, sheet.sheets[index]);
		sheet.trigger?.reset();
		sheet.convert?.();

		const savedScroll = Math.max(0, sheet.scroll ?? 0);
		if (sheet.body) {
			sheet.body.scrollTop = savedScroll;
			sheet.scroll = sheet.body.scrollTop;
		}
		sheet.needsRedraw = true;
		sheet.render?.();

		sheet.edit?.history?.();
		sheet.autoSave?.();
		renderFooter();
		sheet.refreshOverlay?.();
		setTimeout(() => {
			if (Object.keys(sheet.current).length === 0) {
				sheet.panel?.querySelector('.text')?.click();
			}
		}, 0);
	};

	const switchTo = (index) => {
		if (index === sheet.activeSheetIndex) return;
		if (index < 0 || index >= sheet.sheets.length) return;
		applyActive(index);
	};

	const add = () => {
		persistActiveView(sheet);
		const name = createUniqueSheetName(sheet.sheets.map((doc) => doc.name));
		const doc = createEmptySheetDoc(name);
		sheet.sheets.push(doc);
		applyActive(sheet.sheets.length - 1, { skipPersist: true });
	};

	/** 활성 시트 타임라인만 비운다 (#new-sheet · 마지막 탭 삭제 확인). */
	const clearActive = () => {
		const doc = sheet.sheets[sheet.activeSheetIndex];
		doc.timelines = [clone(EMPTY_TIMELINE)];
		doc.scroll = 0;
		doc.current = {};
		doc.selectedRows = [];
		doc.history = { entries: [], index: -1 };
		sheet.timelines = doc.timelines;
		sheet.current = {};
		sheet.selectedRows = [];
		sheet.scroll = 0;
		editHistory.clear();
		sheet.convert?.();
		sheet.needsRedraw = true;
		sheet.render?.();
		sheet.edit?.history?.();
		sheet.autoSave?.();
		sheet.refreshOverlay?.();
	};

	const removeAt = (index) => {
		if (sheet.sheets.length <= 1) {
			ui.confirm({
				title: i18n.t('sheet-tab-last'),
				content: i18n.t('sheet-tab-last-contents'),
				bgDismiss: true,
				success: () => {
					clearActive();
					sheet.current.row = 0;
					sheet.current.col = 0;
					sheet.move?.event?.();
				},
			});
			return;
		}
		ui.confirm({
			title: i18n.t('sheet-tab-delete'),
			content: i18n.t('confirm-sheet-tab-remove'),
			bgDismiss: true,
			success: () => {
				persistActiveView(sheet);
				sheet.sheets.splice(index, 1);
				let next = sheet.activeSheetIndex;
				if (index < next) next -= 1;
				else if (index === next) next = Math.min(next, sheet.sheets.length - 1);
				applyActive(next, { skipPersist: true });
			},
		});
	};

	const rename = (index, nextName) => {
		const trimmed = String(nextName ?? '').trim();
		const doc = sheet.sheets[index];
		if (!doc) return false;
		if (!isValidTabName(trimmed)) {
			ui.alert(i18n.t('sheet-tab-name-invalid'));
			return false;
		}
		if (sheet.sheets.some((other, i) => i !== index && other.name === trimmed)) {
			ui.alert(i18n.t('sheet-tab-name-duplicate'));
			return false;
		}
		doc.name = trimmed;
		sheet.autoSave?.();
		renderFooter();
		return true;
	};

	const getActiveName = () => sheet.sheets[sheet.activeSheetIndex]?.name ?? 'sheet1';

	return {
		renderFooter,
		persistActiveView: () => persistActiveView(sheet),
		switchTo,
		add,
		removeAt,
		rename,
		getActiveName,
		clearActive,
		applyActive,
	};
};

export { createTabs, persistActiveView, restoreView };
