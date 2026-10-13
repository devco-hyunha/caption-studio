import type { CodeMap } from '@/shared/types/shortkey';

/** mask token → event.code 맵 */
const createCodeMap = (): CodeMap => ({
  backspace: 'Backspace',
  tab: 'Tab',
  enter: 'Enter',
  pause: 'Pause',
  capslock: 'CapsLock',
  esc: 'Escape',
  space: 'Space',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  end: 'End',
  home: 'Home',
  left: 'ArrowLeft',
  up: 'ArrowUp',
  right: 'ArrowRight',
  down: 'ArrowDown',
  insert: 'Insert',
  delete: 'Delete',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  ';': 'Semicolon',
  comma: 'Comma',
  '.': 'Period',
  '?': 'Slash',
  '`': 'Backquote',
  '[': 'BracketLeft',
  '\\': 'Backslash',
  ']': 'BracketRight',
  "'": 'Quote',
  minus: ['Minus', 'NumpadSubtract'],
  plus: ['Equal', 'NumpadAdd'],
});

/** 미등록 토큰 → KeyX / DigitN, 없으면 원값 */
const resolveTokenCodes = (token: string, codeMap: CodeMap): string | string[] => {
  if (codeMap[token] !== undefined) return codeMap[token];
  if (/^[a-z]$/i.test(token)) return `Key${token.toUpperCase()}`;
  if (/^[0-9]$/.test(token)) return `Digit${token}`;
  return token;
};

export { createCodeMap, resolveTokenCodes };
