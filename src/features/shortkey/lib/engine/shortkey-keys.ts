import type {
  ShortcutKeyHandler,
  ShortcutParams,
  ShortcutsApi,
  ShortcutType,
} from '@/shared/types/shortkey';
import { isImeKeyEvent } from '@/shared/lib/shortcuts';
import { SHORTKEY_TYPES } from '../../model/keys/ids';
import type { SheetShortkeyId } from '../../types';
import { useShortkeyStore } from '../../model/store/use-shortkey-store';

/** mask는 shortkey store에서 조회, IME 가드를 일괄 적용한 키 정의 */
const defineSheetKey = (
  id: SheetShortkeyId,
  handler: ShortcutKeyHandler,
  options: {
    placeholder?: string;
    type?: ShortcutType;
    preventDefault?: boolean;
    enableInInput?: boolean;
  } = {},
): ShortcutParams => ({
  placeholder: options.placeholder,
  mask: useShortkeyStore.getState().masks[id],
  type: options.type ?? SHORTKEY_TYPES.HOLD,
  preventDefault: options.preventDefault,
  enableInInput: options.enableInInput,
  handler: (event) => {
    if (isImeKeyEvent(event)) return;
    handler(event);
  },
});

const registerSheetKeys = (shortcuts: ShortcutsApi, keys: ShortcutParams[]) => {
  keys.forEach((entry) => shortcuts.add(entry));
};

export { defineSheetKey, registerSheetKeys };
