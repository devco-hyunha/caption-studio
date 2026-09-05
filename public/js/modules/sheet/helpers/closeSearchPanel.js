/**
 * 검색 패널이 열려 있으면 `#sheet-search` 클릭으로 닫는다.
 *
 * @param {object} sheet
 */
const closeSearchPanel = (sheet) => {
	if (!sheet.search?.panel) return;
	document.querySelector('#sheet-search')?.click();
};

export { closeSearchPanel };
