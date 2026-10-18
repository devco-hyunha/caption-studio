import type { CodeMap, KeyEventInput } from '@/shared/types/shortkey';
import { MODIFIER_KEYS, MODIFIER_STATE_KEYS, MODIFIER_TOKENS } from '../engine/modifiers';

/** event.code → mask 토큰 (codeMap 역조회), 없으면 문자·숫자·event.key */
const resolveKeyName = (code: string, key: string, codeMap: CodeMap): string => {
  const matched = Object.entries(codeMap).find(([, value]) => {
    if (Array.isArray(value)) return value.includes(code);
    return value === code;
  });
  if (matched) return matched[0];

  const digit = /^Digit([0-9])$/.exec(code);
  if (digit) return digit[1];

  const letter = /^Key([A-Z])$/.exec(code);
  if (letter) return letter[1].toLowerCase();

  const lower = (key || '').toLowerCase();
  if (!lower || lower === 'unidentified' || MODIFIER_KEYS.has(lower)) return '';
  return lower;
};

/**
 * keydown event → mask 문자열 (설정 UI 커스텀 키 입력).
 * modifier는 MODIFIER_TOKENS 순(ctrl·alt·shift·meta), key가 없으면 빈 문자열.
 */
const convertEventToMask = (event: KeyEventInput, codeMap: CodeMap): string => {
  const keyName = resolveKeyName(event.code, event.key, codeMap);
  if (!keyName) return '';

  const modifiers = MODIFIER_TOKENS.filter((token) => event[MODIFIER_STATE_KEYS[token]]);

  return [...modifiers, keyName].join('+');
};

export { convertEventToMask };
