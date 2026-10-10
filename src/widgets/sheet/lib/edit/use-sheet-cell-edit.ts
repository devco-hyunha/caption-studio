import { MouseEvent as ReactMouseEvent } from 'react';
import type {
	SheetColumnId,
	UseSheetCellEditParams,
	UseSheetCellEditResult,
} from '../../types';
import { canEditColumnId } from '../columns';
import { isMultipleActive } from './is-multiple-active';
import { useSheetCellFocus } from './use-sheet-cell-focus';
import { useSheetCellEditor } from './use-sheet-cell-editor';

/**
 * 셀 편집 오케스트레이터 — focus hook + editor hook를 조합하고 셀 이벤트 핸들러를 노출
 * @param params format, rows, scroll refs, setScrollTop, onCommitCell
 * @returns mode, target, refs, endEdit, applyFocus, 셀 클릭/더블클릭/우클릭, 편집 핸들러
 */
const useSheetCellEdit = (params: UseSheetCellEditParams): UseSheetCellEditResult => {
	const { format, rows, scrollRef, scrollContentRef, setScrollTop, onCommitCell } = params;

	const focus = useSheetCellFocus({ format, rows, scrollRef, scrollContentRef, setScrollTop });
	const editor = useSheetCellEditor({ format, focus, onCommitCell });

	const {
		mode,
		target,
		inputRef,
		wrapRef,
		modeRef,
		targetRef,
		setMode,
		setTarget,
		focusTarget,
		applyFocus,
	} = focus;
	const { beginEdit, commitEdit, endEdit, handleInputKeyDown, handleInputClick, handleEditorBlur } =
		editor;

	/** 셀 클릭 — 다중 선택 중 무시, 편집 중이면 다른 셀 커밋 후 포커스 이동 */
	const handleCellClick = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();

		// multiple 중 셀 클릭(포커스/에딧) 무시
		if (isMultipleActive()) return;

		if (modeRef.current === 'edit') {
			const current = targetRef.current;
			if (current && (current.rowIndex !== rowIndex || current.column !== column)) {
				commitEdit();
			} else if (current?.rowIndex === rowIndex && current.column === column) {
				return;
			}
		}

		if (!canEditColumnId(format, column)) {
			setMode('hidden');
			setTarget(null);
			return;
		}

		focusTarget(rowIndex, column, event.currentTarget);
	};

	/** 더블클릭 → 편집 진입 (다중 선택 중 무시) */
	const handleCellDoubleClick = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();
		if (isMultipleActive()) return;
		beginEdit(rowIndex, column, event.currentTarget);
	};

	/** 우클릭 → 편집 진입 (다중 선택 중 무시) */
	const handleCellContextMenu = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();
		if (isMultipleActive()) return;
		beginEdit(rowIndex, column, event.currentTarget);
	};

	return {
		mode,
		target,
		inputRef,
		wrapRef,
		currentRowIndex: target?.rowIndex ?? null,
		currentColumn: target?.column ?? null,
		endEdit,
		applyFocus,
		handleCellClick,
		handleCellDoubleClick,
		handleCellContextMenu,
		handleInputKeyDown,
		handleInputClick,
		handleEditorBlur,
	};
};

export { useSheetCellEdit };
