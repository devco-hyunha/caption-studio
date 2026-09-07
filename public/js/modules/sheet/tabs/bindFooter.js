import { bindEvent } from '../../utils/dom.js';
import { isValidTabName } from './names.js';

/**
 * 시트 푸터 탭 UI 이벤트를 바인딩한다.
 *
 * 탭명 편집: 입력 중 valid만 · Enter 저장 · Esc/focusout 취소
 *
 * @param {object} sheet
 */
const bindFooter = (sheet) => {
	const footer = sheet.root?.querySelector('.sheet-footer');
	if (!footer) return;
	sheet.footer = footer;
	sheet.tabs.renderFooter();

	const isEditing = (el) => el?.dataset?.editing === '1';

	const markValidity = (el) => {
		const index = Number(el.dataset.index);
		const trimmed = String(el.textContent ?? '').trim();
		const isDuplicate = sheet.sheets.some(
			(other, i) => i !== index && other.name === trimmed,
		);
		const isInvalid = trimmed === ''
			|| !isValidTabName(trimmed)
			|| isDuplicate;
		el.classList.toggle('is-invalid', isInvalid);
		return !isInvalid;
	};

	const beginEdit = (el) => {
		el.dataset.editing = '1';
		el.dataset.originalName = el.textContent ?? '';
		el.contentEditable = 'true';
		el.focus();
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(el);
		selection?.removeAllRanges();
		selection?.addRange(range);
		markValidity(el);
	};

	const endEdit = (el, { commit }) => {
		if (!isEditing(el)) return;
		const index = Number(el.dataset.index);
		const original = el.dataset.originalName ?? '';
		const nextName = el.textContent ?? '';

		if (commit) {
			// rename 성공 시 renderFooter로 노드가 교체되므로 먼저 편집 플래그를 내린다.
			el.dataset.editing = '0';
			el.contentEditable = 'false';
			el.classList.remove('is-invalid');
			delete el.dataset.originalName;
			if (!sheet.tabs.rename(index, nextName)) {
				el.dataset.editing = '1';
				el.dataset.originalName = original;
				el.contentEditable = 'true';
				el.textContent = nextName;
				markValidity(el);
				el.focus();
			}
			return;
		}

		el.dataset.editing = '0';
		el.contentEditable = 'false';
		el.classList.remove('is-invalid');
		delete el.dataset.originalName;
		el.textContent = original;
	};

	bindEvent({
		target: footer,
		event: 'click',
		selector: '.sheet-tab-add',
		handler: (event) => {
			event.preventDefault();
			sheet.tabs.add();
		},
	});

	bindEvent({
		target: footer,
		event: 'click',
		selector: '.sheet-tab-delete',
		handler: (event, matched) => {
			event.preventDefault();
			event.stopPropagation();
			const index = Number(matched.dataset.index);
			if (Number.isNaN(index)) return;
			sheet.tabs.removeAt(index);
		},
	});

	bindEvent({
		target: footer,
		event: 'click',
		selector: '.sheet-tab',
		handler: (event, matched) => {
			if (event.target.closest('.sheet-tab-delete')) return;
			if (isEditing(event.target.closest('.sheet-tab-name'))) return;
			const index = Number(matched.dataset.index);
			if (Number.isNaN(index)) return;
			sheet.tabs.switchTo(index);
		},
	});

	bindEvent({
		target: footer,
		event: 'dblclick',
		selector: '.sheet-tab-name',
		handler: (event, matched) => {
			event.preventDefault();
			if (isEditing(matched)) return;
			beginEdit(matched);
		},
	});

	bindEvent({
		target: footer,
		event: 'input',
		selector: '.sheet-tab-name',
		handler: (_event, matched) => {
			if (!isEditing(matched)) return;
			markValidity(matched);
		},
	});

	bindEvent({
		target: footer,
		event: 'keydown',
		selector: '.sheet-tab-name',
		handler: (event, matched) => {
			if (!isEditing(matched)) return;
			if (event.key === 'Enter') {
				event.preventDefault();
				endEdit(matched, { commit: true });
				return;
			}
			if (event.key === 'Escape') {
				event.preventDefault();
				endEdit(matched, { commit: false });
			}
		},
	});

	bindEvent({
		target: footer,
		event: 'focusout',
		selector: '.sheet-tab-name',
		handler: (_event, matched) => {
			if (!isEditing(matched)) return;
			setTimeout(() => {
				if (!isEditing(matched)) return;
				if (document.activeElement === matched) return;
				endEdit(matched, { commit: false });
			}, 0);
		},
	});

	bindEvent({
		target: footer,
		event: 'keydown',
		selector: '.sheet-tab',
		handler: (event, matched) => {
			if (isEditing(event.target.closest('.sheet-tab-name'))) return;
			if (event.key !== 'Enter' && event.key !== ' ') return;
			event.preventDefault();
			const index = Number(matched.dataset.index);
			if (Number.isNaN(index)) return;
			sheet.tabs.switchTo(index);
		},
	});
};

export { bindFooter };
