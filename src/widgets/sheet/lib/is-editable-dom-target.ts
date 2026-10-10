interface IsEditableDomTargetOptions {
	/**
	 * `true`면 시트 셀 에디터(`[data-slot="sheet-cell-editor"]`)는
	 * native editable로 보지 않음 (이동 키 핸들러용).
	 */
	ignoreSheetCellEditor?: boolean;
}

/** INPUT/TEXTAREA/SELECT · contentEditable — 전역 키 핸들러 가드 */
const isEditableDomTarget = (
	target: EventTarget | null,
	options: IsEditableDomTargetOptions = {},
): boolean => {
	if (!(target instanceof HTMLElement)) return false;
	if (
		options.ignoreSheetCellEditor &&
		target.closest('[data-slot="sheet-cell-editor"]')
	) {
		return false;
	}
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

export { isEditableDomTarget };
