import { useEffect, useRef } from 'react';
import type { UseEditInputSyncParams } from '../../../types';
import { isTextColumn } from '../../columns';
import { focusEditorInput } from './edit-surface';

/**
 * mode/target → contenteditable innerHTML 동기화.
 * focus: 빈 surface, edit: 기존 값 로드(IME 중 innerHTML 금지).
 * @param markBootstrap — beginEdit(applied=false)는 1회 로드 허용, typing(applied=true)은 스킵
 */
const useEditInputSync = ({ mode, target, inputRef, modeRef }: UseEditInputSyncParams) => {
	const bootstrapRef = useRef<{ applied: boolean } | null>(null);

	const markBootstrap = (applied: boolean) => {
		bootstrapRef.current = { applied };
	};

	// refs는 안정적 — mode/target 변경 시에만 실행된다
	useEffect(() => {
		if (!target || !inputRef.current) return;
		if (mode === 'hidden') return;
		if (mode === 'focus' && modeRef.current === 'edit') return;

		const input = inputRef.current;
		if (mode === 'edit') {
			const bootstrap = bootstrapRef.current;
			if (!bootstrap || bootstrap.applied) return;
			bootstrap.applied = true;
			input.innerHTML = isTextColumn(target.column) ? `${target.value}<br>` : target.value;
			focusEditorInput(input, true);
			return;
		}
		input.innerHTML = isTextColumn(target.column) ? '<br>' : target.value;
	}, [mode, target, inputRef, modeRef]);

	return { markBootstrap };
};

export { useEditInputSync };
