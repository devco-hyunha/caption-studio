import { storage } from '../utils/storage.js';
import { clone, extend } from '../utils/object.js';
import { EMPTY_TIMELINE } from './constants.js';
import { applyColumnLayout } from './layout/columns.js';

/**
 * @typedef {Object} SetDeps
 * @property {object} sheet
 * @property {{ t: (key: string) => string }} i18n
 * @property {{ smi: string[], srt: string[] }} header
 */

/**
 * @param {{ columns: string[]|Record<string, string>, format: string, t: (key: string) => string }} options
 * @returns {string}
 */
const buildHeadHtml = ({ columns, format, t }) => {
	const cellList = Object.values(columns)
		.filter((name) => typeof name === 'string')
		.map((name) => `<div class="${name} col"><div class="cell">${t(`${name}-${format}`)}</div></div>`)
		.join('');

	return `<div class="sheet-row">${cellList}</div>`;
};

/**
 * 시트 문서(format · timelines · 헤더)를 반영하는 함수를 만든다.
 *
 * @param {SetDeps} deps
 * @returns {(options?: object) => void}
 */
const createSet = ({ sheet, i18n, header }) => (options = {}) => {
	const { panel, convert, render, current } = sheet;

	sheet.trigger?.reset();

	if (!sheet.format && !options.format) sheet.format = storage.get('format');
	if (!sheet.format || sheet.format === '') sheet.format = 'smi';

	if (options.format && options.format !== sheet.format) {
		sheet.format = options.format;
		if (sheet.format === 'smi' && current.col > 0) --current.col;
		if (sheet.format === 'srt' && current.col > 0) ++current.col;
	}

	extend(sheet, options);

	if (!options.timelines && sheet.timelines.length === 0) {
		sheet.timelines = storage.get('SUBTITLE_TEMP');
	}
	if (!sheet.timelines || sheet.timelines === '' || sheet.timelines.length === 0) {
		sheet.timelines = [clone(EMPTY_TIMELINE)];
	}
	storage.set('SUBTITLE_TEMP', sheet.timelines);

	sheet.root.className = sheet.format;
	sheet.head = sheet.root.querySelector('.sheet-head');
	sheet.headPanel = sheet.head?.querySelector('.sheet-panel') ?? null;
	if (sheet.headPanel) {
		sheet.headPanel.innerHTML = buildHeadHtml({
			columns: header[sheet.format],
			format: sheet.format,
			t: i18n.t,
		});
	}

	applyColumnLayout(sheet);
	convert();
	sheet.needsRedraw = true;
	render();

	setTimeout(() => {
		if (Object.keys(current).length === 0) {
			panel?.querySelector('.text')?.click();
		}
	}, 0);
};

export { createSet };
