/**
 * @param {string} selector
 * @param {boolean} disabled
 */
const setDisabled = (selector, disabled) => {
	document.querySelectorAll(selector).forEach((node) => {
		node.classList.toggle('disabled', disabled);
	});
};

/**
 * 셀 타깃에 맞춰 텍스트/시간 툴바 활성 상태를 갱신한다.
 *
 * @param {string} target
 */
const syncToolbar = (target) => {
	const isTime = target === 'starttime' || target === 'endtime';
	const isText = target === 'text' || target === 'memo';
	if (!isTime && !isText) return;

	setDisabled('.btn-text-controls', isTime);
	setDisabled('.btn-time-controls', isText);
};

export { setDisabled, syncToolbar };
