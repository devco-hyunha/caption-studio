import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { checkIsInput } from '@/shared/lib/shortcuts';
import { isImeKeyEvent } from '../shortkey-keys';

const isPrintableShortcutEvent = (event: KeyboardEvent) => {
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (event.key.length === 1 || event.code === 'Space') return true;
	if (event.key === 'Process' || event.keyCode === 229) return true;
	if (event.isComposing) return true;
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
		// Slash는 검색 패널 토글이 선점 — 에딧 창이 열리지 않도록 제외
		if (event.code === 'Slash') return;
		actions.beginEditFromTyping(event);
	});
};

export { bindPrintableEditCallback };
