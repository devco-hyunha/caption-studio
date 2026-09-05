import { clone } from '../utils/index.js';
import { bindEvent } from '../utils/dom.js';

/**
 * 시트 검색·에러 카운트 UI.
 *
 * @param {{ sheet: object }} deps
 * @returns {object}
 */
const createSearch = ({ sheet }) => {
	const search = {
		panel: false,
		state: null,
		current: 0,
		form: null,
	};

	const setFormSearchDisabled = (disabled) => {
		document.querySelectorAll('.form-sheet-search input, .form-sheet-search button').forEach((node) => {
			node.disabled = disabled;
		});
	};

	const syncNavButtons = (hitCount) => {
		if (!search.form) return;
		search.form.querySelectorAll(':scope > a').forEach((node) => {
			node.classList.remove('disabled');
		});
		const prevBtn = search.form.querySelector('.btn-prev');
		const nextBtn = search.form.querySelector('.btn-next');
		if (search.current <= 0) prevBtn?.classList.add('disabled');
		if (search.current >= hitCount - 1) nextBtn?.classList.add('disabled');
	};

	search.move = () => {
		const hitCount = sheet.searchHits.length;
		if (hitCount > 0) {
			sheet.current = clone(sheet.searchHits[search.current]);
			sheet.move.event();
		} else {
			search.current = -1;
		}
		const resultEl = document.querySelector('#sheet-search-panel .result');
		if (resultEl) resultEl.textContent = `${search.current + 1}/${hitCount}`;
		syncNavButtons(hitCount);
	};

	search.loop = (query) => {
		sheet.searchHits = [];
		if (query) {
			const textCol = sheet.format === 'smi' ? 1 : 2;
			const memoCol = sheet.format === 'smi' ? 2 : 3;
			sheet.timelines.forEach((timeline, rowIndex) => {
				if (timeline.text.toLowerCase().search(query) > -1) {
					sheet.searchHits.push({ row: rowIndex, col: textCol });
				}
				if (timeline.memo.toLowerCase().search(query) > -1) {
					sheet.searchHits.push({ row: rowIndex, col: memoCol });
				}
			});
		}
		search.current = 0;
		search.move();
		sheet.needsRedraw = true;
		sheet.render();
	};

	search.error = (errorRows = sheet.errorRows) => {
		const errorSize = errorRows.length;
		const errorCount = document.querySelector('.error-count');
		const errorLabel = document.querySelector('.error-label');
		if (!errorLabel) return;
		if (errorSize) {
			if (errorCount) errorCount.textContent = String(errorSize);
			errorLabel.style.display = '';
			return;
		}
		errorLabel.style.display = 'none';
	};

	search.init = () => {
		search.form = document.querySelector('#sheet-search-panel');
		const searchInput = search.form?.querySelector('.i-sheet-search');
		if (!search.form || !searchInput) return;

		const sheetSearchBtn = document.querySelector('#sheet-search');
		if (sheetSearchBtn) {
			bindEvent({
				target: sheetSearchBtn,
				event: 'click.sheet-search',
				handler: () => {
					search.panel = !search.panel;
					searchInput.value = '';
					search.loop('');
					sheet.needsRedraw = true;
					sheet.render();
					setTimeout(() => {
						if (search.panel) searchInput.focus();
					});
				},
			});
		}
		bindEvent({
			target: searchInput,
			event: 'focusin.sheet-search',
			handler: () => {
				search.state = true;
			},
		});
		bindEvent({
			target: searchInput,
			event: 'focusout.sheet-search',
			handler: () => {
				search.state = null;
			},
		});

		const prevBtn = search.form.querySelector('.btn-prev');
		const nextBtn = search.form.querySelector('.btn-next');
		if (prevBtn) {
			bindEvent({
				target: prevBtn,
				event: 'click.sheet-search',
				handler: (event) => {
					event.preventDefault();
					if (prevBtn.classList.contains('disabled')) return;
					if (search.current > 0) {
						--search.current;
						search.move();
					}
				},
			});
		}
		if (nextBtn) {
			bindEvent({
				target: nextBtn,
				event: 'click.sheet-search',
				handler: (event) => {
					event.preventDefault();
					if (nextBtn.classList.contains('disabled')) return;
					if (search.current < sheet.searchHits.length - 1) {
						++search.current;
						search.move();
					}
				},
			});
		}

		const errorSearch = search.form.querySelector('#error-search');
		if (errorSearch) {
			bindEvent({
				target: errorSearch,
				event: 'change.sheet-search',
				handler: () => {
					if (errorSearch.checked) {
						searchInput.value = '';
						sheet.errorRows.sort((a, b) => a - b);
						sheet.searchHits = sheet.errorRows.map((row) => ({ row, col: 0 }));
						search.current = 0;
						search.move();
						sheet.needsRedraw = true;
						sheet.render();
						setFormSearchDisabled(true);
						return;
					}
					sheet.searchHits = [];
					search.loop('');
					setFormSearchDisabled(false);
				},
			});
		}

		const form = document.querySelector('.form-sheet-search');
		if (form) {
			bindEvent({
				target: form,
				event: 'submit.sheet-search',
				handler: (event) => {
					event.preventDefault();
					search.loop(searchInput.value.toLowerCase());
				},
			});
		}
	};

	return search;
};

export { createSearch };
