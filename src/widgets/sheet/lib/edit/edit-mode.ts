import type { SheetEditKeyProbe, EditModeDeps } from '../../types';
import { isTextColumn } from '../columns';
import { shouldBeginEditFromKey } from './edit-keys';

/** 편집 모드 판별 — mode/target ref만 읽는 순수 predicate (DOM·스토어 무관) */

const isEditingMode = (modeRef: EditModeDeps['modeRef']) => modeRef.current === 'edit';

const isTextTargetMode = (targetRef: EditModeDeps['targetRef']) =>
	targetRef.current != null && isTextColumn(targetRef.current.column);

const hasFocusMode = (modeRef: EditModeDeps['modeRef'], targetRef: EditModeDeps['targetRef']) =>
	modeRef.current !== 'hidden' && targetRef.current != null;

/**
 * 키 입력 편집 진입 판별 — focus 모드·text 열·진입 키 순서로 검사.
 * Enter는 `enter`(호출측 preventDefault + beginEdit), 문자/IME는 `typing`.
 */
const resolveEditKeyIntent = (
	mode: EditModeDeps,
	event: SheetEditKeyProbe,
): 'enter' | 'typing' | null => {
	if (mode.modeRef.current !== 'focus') return null;
	if (!isTextTargetMode(mode.targetRef)) return null;
	if (event.key === 'Enter') return 'enter';
	if (!shouldBeginEditFromKey(event)) return null;
	return 'typing';
};

export { isEditingMode, isTextTargetMode, hasFocusMode, resolveEditKeyIntent };
