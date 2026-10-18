/** IME 조합 중 keydown(특히 Tab 확정) 무시 — 이중 이동·투입 방지. engine·설정 UI 공통 정본 */
const isImeKeyEvent = (event: KeyboardEvent) =>
  event.isComposing ||
  event.keyCode === 229 ||
  event.key === 'Process' ||
  event.key === 'Unidentified';

export { isImeKeyEvent };
