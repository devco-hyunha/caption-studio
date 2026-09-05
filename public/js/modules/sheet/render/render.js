import { findRowAfterOffset } from './findRowAfterOffset.js';
import { renderRowsHtml } from './renderRowsHtml.js';

/**
 * @typedef {Object} RenderDeps
 * @property {object} sheet - body · panel · needsRedraw · scroll · height · canvas · rowInfo · format · current · focus · searchHits
 */

/**
 * 시트 뷰포트 렌더 함수를 만든다.
 *
 * @param {RenderDeps} deps
 * @returns {() => void}
 */
const createRender = ({ sheet }) => () => {
	const { body, panel, rowInfo, canvas, height, current, focus, searchHits } = sheet;
	if (!body || !panel) return;

	const scrollTop = body.scrollTop;
	if (!sheet.needsRedraw && scrollTop === sheet.scroll && height >= canvas.height) return;

	sheet.needsRedraw = false;
	const startRow = findRowAfterOffset(rowInfo, scrollTop - canvas.height);
	sheet.scroll = scrollTop;
	if (!startRow) return;

	panel.style.paddingTop = `${startRow.offset}px`;
	panel.innerHTML = renderRowsHtml({ sheet, startRow });
	panel.querySelector(`.row-${current.row} .col-${current.col}`)?.classList.add('current');
	if (focus) panel.querySelector(`.row-${focus}`)?.classList.add('focus');

	searchHits.forEach(({ row, col }) => {
		panel.querySelector(`.row-${row} .col-${col}`)?.classList.add('search');
	});
};

export { createRender };
