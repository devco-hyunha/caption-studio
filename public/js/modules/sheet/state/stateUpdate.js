/**
 * @typedef {Object} StateUpdateDeps
 * @property {object} sheet - setCanvas · body · bodyScroll · headPanel · current · getColWidth · trigger
 */

/**
 * 뷰포트·헤더 가로 동기화·트리거 너비를 갱신하는 함수를 만든다.
 * `.sheet-body` 가로 스크롤 → `.sheet-head .sheet-panel`에 `translateX(-scrollLeft)`.
 *
 * @param {StateUpdateDeps} deps
 * @returns {() => void}
 */
const createStateUpdate = ({ sheet }) => () => {
	sheet.setCanvas({
		width: sheet.bodyScroll?.offsetWidth ?? 0,
		height: sheet.body?.clientHeight ?? 0,
	});

	if (sheet.headPanel && sheet.body) {
		const scrollLeft = sheet.body.scrollLeft;
		sheet.headPanel.style.transform = scrollLeft
			? `translateX(${-scrollLeft}px)`
			: '';
	}

	if (sheet.current.target) {
		const minWidth = sheet.getColWidth(sheet.current.target);
		if (minWidth != null) sheet.trigger?.setMinWidth(minWidth);
	}
};

export { createStateUpdate };
