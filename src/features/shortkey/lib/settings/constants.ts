import { createCodeMap } from '@/shared/lib/shortcuts';

const CODE_MAP = createCodeMap();

/** submit 검증 실패 메시지 — 이벤트 시점 문자열은 store 직접 읽기 */
const STATUS_MESSAGES = {
  empty: 'shortkey.statusEmpty',
  single: 'shortkey.statusSingle',
  conflict: 'shortkey.statusConflict',
} as const;

/** IME 조합·code 없는 키 unsupported · 저장 성공 메시지 */
const STATUS_UNSUPPORTED_KEY = 'shortkey.statusUnsupported';
const STATUS_SAVED_KEY = 'shortkey.statusSaved';

export { CODE_MAP, STATUS_MESSAGES, STATUS_SAVED_KEY, STATUS_UNSUPPORTED_KEY };
