/**
 * 셀 클릭으로 현재 선택·트리거·편집 진입을 처리하는 함수를 만든다.
 *
 * @param {object} sheet
 * @returns {(col: Element, context?: boolean) => false}
 */
const createClick = (sheet) => (col, context = false) => {
	if (sheet.edit?.state) sheet.edit.off();

	const row = Number(col?.dataset?.row);
	const target = col?.dataset?.target;
	if (!col || target == null || Number.isNaN(row)) return false;

	const current = {
		row,
		col: Number(col.dataset.col),
		left: col.dataset.left,
		target,
	};

	if (sheet.multiple?.state) sheet.multiple.toggleRow(current.row);

	const isMoved = sheet.current.row !== current.row || sheet.current.col !== current.col;
	if (isMoved) {
		current.info = sheet.rowInfo[current.row];
		current.data = sheet.timelines[current.row];
		sheet.active = sheet.current = current;

		sheet.panel?.querySelectorAll('.col.current').forEach((node) => {
			node.classList.remove('current');
		});
		col.classList.add('current');
		sheet.trigger.focus(col);
	}

	const isEditableTarget = current.target === 'text' || current.target === 'memo';
	if (!sheet.multiple?.state && context && isEditableTarget) {
		sheet.edit.on();
	}

	return false;
};

export { createClick };
