import { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { ShortcutKeyHandler } from '@/features/shortkey';
import type {
	SheetCellEditTarget,
	SheetCellEditorMode,
	SheetColumnId,
	UseSheetCellEditorParams,
	UseSheetCellEditorResult,
} from '../../types';
import { canEditColumnId, isTextColumn } from '../columns';
import { isMultipleActive } from '../is-multiple-active';
import { encodeCellHtml, resolveCommitValue } from './encode-cell-html';
import { isImeStartKey } from './edit-keys';
import { isEditingMode, isTextTargetMode, isTimeTargetMode, hasFocusMode, resolveEditKeyIntent } from './edit-mode';
import { insertEditorLineBreak } from './edit-commands';
import {
	clearEditingSurfaceStyles,
	flushModeOnCompositionEnd,
	isBlurOutsideEditor,
	showEditingSurface,
} from './edit-surface';
import { useEditInputSync } from './use-edit-input-sync';

/**
 * 편집 수명 주기 — focus hook가 소유한 mode/target/refs를 공유
 * @param params format, focus(useSheetCellFocus 결과), onCommitCell
 * @returns mode, target, refs, beginEdit/commitEdit/cancelEdit/endEdit, React 핸들러
 */
const useSheetCellEditor = (params: UseSheetCellEditorParams): UseSheetCellEditorResult => {
	const { format, focus, onCommitCell } = params;
	const {
		mode,
		target,
		inputRef,
		wrapRef,
		modeRef,
		targetRef,
		setMode,
		setTarget,
		focusSelectionTarget,
		resolveMeasuredTarget,
	} = focus;

	const { markBootstrap } = useEditInputSync({ mode, target, inputRef, modeRef });

	/** mode 전이 한 곳 — ref mutate + surface style 복귀 + React sync, 필요 시 포커스 복귀 */
	const setEditorMode = (next: SheetCellEditorMode, restoreFocus = false) => {
		modeRef.current = next;
		clearEditingSurfaceStyles(wrapRef.current);
		setMode(next);
		if (restoreFocus) {
			requestAnimationFrame(() => focusSelectionTarget());
		}
	};

	/** 문자/IME 진입 — surface 즉시 노출, setMode는 compositionend/microtask 후 (IME 조합 보존) */
	const activateEditFromTyping = (isIme: boolean) => {
		if (isMultipleActive()) return;
		markBootstrap(true);
		modeRef.current = 'edit';
		showEditingSurface(wrapRef.current);

		const flushMode = () => {
			if (modeRef.current === 'edit') setEditorMode('edit');
		};

		if (isIme) {
			// compositionend 전에 setMode 하면 ㅇ+ㅏ 조합이 끊김 — end에서만 동기화
			flushModeOnCompositionEnd(inputRef.current, flushMode);
			return;
		}
		queueMicrotask(flushMode);
	};

	/** 더블클릭/우클릭/Enter — 기존 값 로드 + 전체 선택 */
	const beginEdit = (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => {
		if (isMultipleActive()) return;
		if (!canEditColumnId(format, column)) return;
		// context 편집은 text/memo만
		if (!isTextColumn(column)) return;

		const next: SheetCellEditTarget | null =
			cell != null
				? resolveMeasuredTarget(rowIndex, column, cell)
				: targetRef.current?.rowIndex === rowIndex && targetRef.current.column === column
					? targetRef.current
					: null;
		if (!next) return;

		markBootstrap(false);
		setEditorMode('edit');
		setTarget(next);
	};

	/** 편집 커밋 — input을 HTML로 인코딩해 값이 바뀌면 스토어에 반영 */
	const commitEdit = (keepFocus = false) => {
		const current = targetRef.current;
		if (!current || modeRef.current !== 'edit') {
			if (!keepFocus) {
				setMode('hidden');
				setTarget(null);
			}
			return;
		}
		const encoded = encodeCellHtml(inputRef.current);
		const nextValue = resolveCommitValue(current.column, encoded, inputRef.current?.innerText);
		if (nextValue !== current.value) {
			onCommitCell(current.rowIndex, current.column, nextValue);
		}
		if (keepFocus) {
			setEditorMode('focus', true);
			return;
		}
		setEditorMode('hidden');
		setTarget(null);
	};

	/** ESC 취소 — 값은 되돌리고 셀 선택(focus)은 유지 */
	const cancelEdit = () => {
		if (modeRef.current !== 'edit') return;
		setEditorMode('focus', true);
	};

	/** 기본 커밋. keepFocus는 이동 직전용 */
	const endEdit = (commit = true) => {
		if (modeRef.current !== 'edit') return;
		if (commit) {
			commitEdit(true);
			return;
		}
		setEditorMode('focus', true);
	};

	/** F2 / Enter(비에딧) — 현재 포커스 셀 편집 */
	const beginEditOnCurrent = () => {
		if (isMultipleActive()) return;
		const current = targetRef.current;
		if (!current || !isTextColumn(current.column)) return;
		if (modeRef.current === 'edit') return;
		beginEdit(current.rowIndex, current.column);
	};

	/** printable / IME — shortkey callback용 */
	const beginEditFromTyping: ShortcutKeyHandler = (event) => {
		if (isMultipleActive()) return;
		const intent = resolveEditKeyIntent({ modeRef, targetRef }, event);
		if (!intent) return;
		if (intent === 'enter') {
			const current = targetRef.current;
			if (current) beginEdit(current.rowIndex, current.column);
			return;
		}
		activateEditFromTyping(isImeStartKey(event));
	};

	const isEditing = () => isEditingMode(modeRef);

	const isTextTarget = () => isTextTargetMode(targetRef);

	const isTimeTarget = () => isTimeTargetMode(targetRef);

	const hasFocus = () => hasFocusMode(modeRef, targetRef);

	const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (!isMultipleActive()) {
			const intent = resolveEditKeyIntent({ modeRef, targetRef }, event);
			if (intent === 'enter') {
				event.preventDefault();
				const current = targetRef.current;
				if (current) beginEdit(current.rowIndex, current.column);
				return;
			}
			if (intent === 'typing') {
				activateEditFromTyping(isImeStartKey(event));
				return;
			}
		}
		if (modeRef.current !== 'edit') return;
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
			return;
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			if (isTextColumn(targetRef.current?.column ?? 'index')) {
				event.preventDefault();
				insertEditorLineBreak();
				return;
			}
			event.preventDefault();
			commitEdit();
		}
	};

	const handleInputClick = (event: ReactMouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (modeRef.current === 'edit') inputRef.current?.focus();
	};

	const handleEditorBlur = () => {
		if (modeRef.current !== 'edit') return;
		window.setTimeout(() => {
			if (modeRef.current !== 'edit') return;
			if (isBlurOutsideEditor(inputRef.current, wrapRef.current, document.activeElement)) {
				commitEdit();
			}
		}, 0);
	};

	return {
		mode,
		target,
		inputRef,
		wrapRef,
		beginEdit,
		beginEditOnCurrent,
		beginEditFromTyping,
		isEditing,
		isTextTarget,
		isTimeTarget,
		hasFocus,
		commitEdit,
		cancelEdit,
		endEdit,
		insertEditorLineBreak,
		handleInputKeyDown,
		handleInputClick,
		handleEditorBlur,
	};
};

export { useSheetCellEditor };
