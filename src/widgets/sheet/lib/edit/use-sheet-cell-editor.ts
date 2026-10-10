import {
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useEffect,
	useRef,
} from 'react';
import type {
	SheetCellEditTarget,
	SheetColumnId,
	SheetEditKeyProbe,
	UseSheetCellEditorParams,
	UseSheetCellEditorResult,
} from '../../types';
import { canEditColumnId, isTextColumn } from '../columns';
import { isEditableDomTarget } from '../is-editable-dom-target';
import { isMultipleActive } from './is-multiple-active';
import { encodeCellHtml } from './encode-cell-html';
import { insertEditorLineBreak, isImeStartKey, shouldBeginEditFromKey } from './edit-keys';
import { clearEditingSurfaceStyles, focusEditorInput, showEditingSurface } from './edit-surface';

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

	/** 편집 진입 1회 부트스트랩 — Strict Mode 중복 effect 대비 */
	const editBootstrapRef = useRef<{ applied: boolean } | null>(null);

	const activateEditFromTyping = (isIme: boolean) => {
		if (isMultipleActive()) return;
		editBootstrapRef.current = { applied: true };
		modeRef.current = 'edit';
		showEditingSurface(wrapRef.current);

		if (isIme) {
			const input = inputRef.current;
			let didFlush = false;
			const flushMode = () => {
				if (didFlush) return;
				didFlush = true;
				clearEditingSurfaceStyles(wrapRef.current);
				if (modeRef.current === 'edit') setMode('edit');
			};
			// compositionend 전에 setMode 하면 ㅇ+ㅏ 조합이 끊김 — end에서만 동기화
			input?.addEventListener('compositionend', flushMode, { once: true });
			return;
		}

		queueMicrotask(() => {
			clearEditingSurfaceStyles(wrapRef.current);
			if (modeRef.current === 'edit') setMode('edit');
		});
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

		editBootstrapRef.current = { applied: false };
		modeRef.current = 'edit';
		clearEditingSurfaceStyles(wrapRef.current);
		setTarget(next);
		setMode('edit');
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
		const nextValue =
			current.column === 'text' || current.column === 'memo'
				? encoded
				: (inputRef.current?.innerText ?? encoded).trim();
		if (nextValue !== current.value) {
			onCommitCell(current.rowIndex, current.column, nextValue);
		}
		if (keepFocus) {
			modeRef.current = 'focus';
			clearEditingSurfaceStyles(wrapRef.current);
			setMode('focus');
			requestAnimationFrame(() => focusSelectionTarget(current.column));
			return;
		}
		modeRef.current = 'hidden';
		clearEditingSurfaceStyles(wrapRef.current);
		setMode('hidden');
		setTarget(null);
	};

	/** ESC 취소 — 값은 되돌리고 셀 선택(focus)은 유지 */
	const cancelEdit = () => {
		if (modeRef.current !== 'edit') return;
		modeRef.current = 'focus';
		clearEditingSurfaceStyles(wrapRef.current);
		setMode('focus');
		requestAnimationFrame(() => focusSelectionTarget());
	};

	/** 기본 커밋. keepFocus는 이동 직전용 */
	const endEdit = (commit = true) => {
		if (modeRef.current !== 'edit') return;
		if (commit) {
			commitEdit(true);
			return;
		}
		modeRef.current = 'focus';
		clearEditingSurfaceStyles(wrapRef.current);
		setMode('focus');
		requestAnimationFrame(() => focusSelectionTarget());
	};

	const tryBeginEditFromKey = (event: SheetEditKeyProbe): boolean => {
		if (isMultipleActive()) return false;
		if (modeRef.current !== 'focus') return false;
		const current = targetRef.current;
		if (!current || !isTextColumn(current.column)) return false;
		if (!shouldBeginEditFromKey(event)) return false;
		if (event.key === 'Enter') {
			event.preventDefault?.();
			beginEdit(current.rowIndex, current.column);
			return true;
		}
		activateEditFromTyping(isImeStartKey(event));
		return true;
	};

	// window 키 리스너는 ref로 최신 클로저를 사용 — mode/target deps 불필요
	const tryBeginEditFromKeyRef = useRef<(event: SheetEditKeyProbe) => boolean>(() => false);
	useEffect(() => {
		tryBeginEditFromKeyRef.current = tryBeginEditFromKey;
	});

	const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (tryBeginEditFromKey(event)) return;
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
			const active = document.activeElement;
			if (active === inputRef.current || active === wrapRef.current) return;
			if (wrapRef.current?.contains(active)) return;
			commitEdit();
		}, 0);
	};

	// focus 상태에서 인쇄 키 → 편집 진입 (input 내 키는 handleInputKeyDown에서 처리)
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (modeRef.current !== 'focus') return;
			const current = targetRef.current;
			if (!current || !isTextColumn(current.column)) return;
			if (isEditableDomTarget(event.target)) return;
			tryBeginEditFromKeyRef.current(event);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
		// refs는 안정적 — deps에 포함해도 effect는 재실행되지 않는다
	}, [modeRef, targetRef, tryBeginEditFromKeyRef]);

	// focus: 빈 편집 surface, edit: 기존 값 로드 (IME 중 innerHTML 금지)
	useEffect(() => {
		if (!target || !inputRef.current) return;
		if (mode === 'hidden') return;
		if (mode === 'focus' && modeRef.current === 'edit') return;
		const input = inputRef.current;
		if (mode === 'edit') {
			const bootstrap = editBootstrapRef.current;
			if (!bootstrap || bootstrap.applied) return;
			bootstrap.applied = true;
			input.innerHTML = isTextColumn(target.column) ? `${target.value}<br>` : target.value;
			focusEditorInput(inputRef.current, true);
			return;
		}
		input.innerHTML = isTextColumn(target.column) ? '<br>' : target.value;
		// refs는 안정적 — mode/target 변경 시에만 실행된다
	}, [mode, target, inputRef, modeRef]);

	return {
		mode,
		target,
		inputRef,
		wrapRef,
		activateEditFromTyping,
		beginEdit,
		commitEdit,
		cancelEdit,
		endEdit,
		tryBeginEditFromKey,
		handleInputKeyDown,
		handleInputClick,
		handleEditorBlur,
	};
};

export { useSheetCellEditor };
