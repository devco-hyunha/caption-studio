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

export { showEditingSurface, clearEditingSurfaceStyles, focusEditorInput };
