import type { SheetShortkeyActions } from '@/features/shortkey';
import type { BuildSheetShortkeyActionsParams } from '../../types';

/** shortkey에 주입할 시트 동작 API 조립 — sheet-body 비대화 방지 */
const buildSheetShortkeyActions = ({
	move,
	isEditing,
	isTextTarget,
	hasFocus,
	isMultiple,
	beginEdit,
	cancelEdit,
	beginEditFromTyping,
	insertEditorLineBreak,
	toggleMultiple,
	toggleRowSelect,
	insertRow,
	removeRow,
}: BuildSheetShortkeyActionsParams): SheetShortkeyActions => ({
	...move,
	isEditing,
	isTextTarget,
	hasFocus,
	isMultiple,
	beginEdit,
	cancelEdit,
	beginEditFromTyping,
	insertEditorLineBreak,
	toggleMultiple,
	toggleRowSelect,
	insertRow,
	removeRow,
});

export { buildSheetShortkeyActions };
