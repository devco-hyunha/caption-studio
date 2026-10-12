/** React 리렌더 없이 편집 면 노출 — IME 조합 중 setMode 금지용 */
const showEditingSurface = (wrap: HTMLElement | null) => {
	if (!wrap) return;
	wrap.classList.add('on');
	wrap.style.opacity = '1';
	wrap.style.zIndex = '3';
	wrap.style.pointerEvents = 'auto';
};

/** 편집 면 원상 복귀 — inline style 제거 (`on` 클래스는 React mode가 관리) */
const clearEditingSurfaceStyles = (wrap: HTMLElement | null) => {
	if (!wrap) return;
	wrap.style.opacity = '';
	wrap.style.zIndex = '';
	wrap.style.pointerEvents = '';
};

/** IME 조합 종료 후 flush — compositionend 1회 리스너 (setMode 지연 동기화) */
const flushModeOnCompositionEnd = (input: HTMLElement | null, flush: () => void) => {
	if (!input) return;
	input.addEventListener('compositionend', flush, { once: true });
};

/** blur 시 포커스가 에디터(wrap/input) 밖으로 나갔는지 */
const isBlurOutsideEditor = (
	input: HTMLElement | null,
	wrap: HTMLElement | null,
	active: Element | null,
): boolean => {
	if (active === input || active === wrap) return false;
	if (wrap?.contains(active)) return false;
	return true;
};

/** 에디터 input 포커스 — Enter는 전체 선택, 타입 투 리플레이스는 커서 우측 */
const focusEditorInput = (input: HTMLElement | null, selectAll: boolean) => {
	if (!input) return;
	input.focus({ preventScroll: true });
	const selection = window.getSelection();
	if (!selection) return;
	const range = document.createRange();
	range.selectNodeContents(input);
	if (!selectAll) range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
};

export {
	showEditingSurface,
	clearEditingSurfaceStyles,
	flushModeOnCompositionEnd,
	isBlurOutsideEditor,
	focusEditorInput,
};
