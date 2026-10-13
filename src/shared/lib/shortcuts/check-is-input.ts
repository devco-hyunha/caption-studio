const INPUT_TYPES = ['text', 'password', 'file', 'search', 'number', 'url'] as const;

/**
 * 텍스트 input · textarea · select — 시트 contenteditable은 제외 (Decision).
 * I/O 패널 `<select>` 포커스 중 ↑↓·Ctrl+Z가 시트로 새는 것 방지.
 */
const checkIsInput = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement) || !target.tagName) return false;
  const name = target.tagName.toLowerCase();
  if (name === 'textarea' || name === 'select' || name === 'option') return true;
  if (name !== 'input') return false;
  const type = 'type' in target ? String((target as HTMLInputElement).type) : '';
  return (INPUT_TYPES as readonly string[]).includes(type);
};

export { checkIsInput };
