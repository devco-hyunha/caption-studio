import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { checkIsInput, isImeKeyEvent } from '@/shared/lib/shortcuts';

const isPrintableShortcutEvent = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return false;
  if (event.key.length === 1 || event.code === 'Space') return true;
  return false;
};

/** printable → edit.on (타입 투 리플레이스) */
const bindPrintableEditCallback = (
  shortcuts: ShortcutsApi,
  getActions: () => SheetShortkeyActions,
) => {
  shortcuts.callback((event) => {
    if (isImeKeyEvent(event)) return;
    if (checkIsInput(event.target)) return;
    const actions = getActions();
    if (actions.isEditing()) return;
    if (actions.isMultiple()) return;
    if (!actions.isTextTarget()) return;
    if (!isPrintableShortcutEvent(event)) return;
    // Space는 선택 토글 키가 선점 — 타입 투 리플레이스에서 제외
    if (event.code === 'Space' || event.key === ' ') return;
    actions.beginEditFromTyping(event);
  });
};

export { bindPrintableEditCallback };
