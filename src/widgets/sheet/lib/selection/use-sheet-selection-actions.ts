import { useLayoutEffect, useRef } from 'react';

import { useSheetStore } from '@/entities/subtitle-sheet';
import { getEditableColIndex, getEditableColumn } from '../move/sheet-move';
import type {
	SheetColumnId,
	SheetMoveCursor,
	UseSheetSelectionActionsParams,
	UseSheetSelectionActionsResult,
} from '../../types';

/** 다중 선택 상태 + 행 CRUD 조립(스토어 셀렉터, pending focus) */
const useSheetSelectionActions = ({
	format,
	rows,
	totalHeight,
	isEditing,
	currentRowIndex,
	currentColumn,
	endEdit,
	applyFocus,
}: UseSheetSelectionActionsParams): UseSheetSelectionActionsResult => {
	const multipleActive = useSheetStore((state) => state.sheets[state.active]?.multipleActive === true);
	const toggleMultipleAction = useSheetStore((state) => state.toggleMultiple);
	const toggleSelectedRowAction = useSheetStore((state) => state.toggleSelectedRow);
	const setMultipleStartAction = useSheetStore((state) => state.setMultipleStart);
	const insertTimelineAfterAction = useSheetStore((state) => state.insertTimelineAfter);
	const removeTimelineAtAction = useSheetStore((state) => state.removeTimelineAt);

	const pendingFocusRef = useRef<{ row: number; column: SheetColumnId } | null>(null);

	// 시트 렌더가 새 행을 반영한 뒤에 스크롤·포커스 (아니면 scrollHeight 클램프)
	useLayoutEffect(() => {
		const pending = pendingFocusRef.current;
		if (!pending) return;
		if (!rows[pending.row]) return;
		if (totalHeight + 0.5 < rows.reduce((sum, row) => sum + (row.height ?? 0), 0)) return;
		pendingFocusRef.current = null;
		applyFocus(pending.row, pending.column);
	}, [rows, totalHeight, applyFocus]);

	/** 포커스 기준 행 — 셀 포커스가 없으면 첫 행 */
	const resolveFocusRow = () => {
		if (currentRowIndex != null) return currentRowIndex;
		return 0;
	};

	/** 포커스 기준 editable 열 인덱스 — 셀 포커스가 없으면 첫 열 */
	const resolveFocusCol = () => {
		if (currentColumn == null) return 0;
		const index = getEditableColIndex(format, currentColumn);
		return index >= 0 ? index : 0;
	};

	/** 행 CRUD 후 포커스 대상 등록 — 새 행이 렌더에 반영된 뒤 layoutEffect가 적용 */
	const focusAfter = (row: number, col: number) => {
		const column = getEditableColumn(format, col);
		if (!column) return;
		pendingFocusRef.current = { row, column };
	};

	/** Tab이 마지막 행 아래로 나간 경우: 커서 행 뒤에 행 삽입 */
	const handleAppendRow = (cursor: SheetMoveCursor) => {
		const insertIndex = insertTimelineAfterAction(cursor.row, format);
		if (insertIndex == null) return;
		focusAfter(insertIndex, cursor.col);
	};

	/** 행 이동 통보(화살표) — 다중 선택 중일 때만. Shift: 선택 확장, 그 외: 앵커 이동 */
	const handleRowMoved = (row: number, withShift: boolean) => {
		const state = useSheetStore.getState();
		const active = state.sheets[state.active];
		if (!active?.multipleActive) return;
		if (withShift) {
			toggleSelectedRowAction(row, true);
			return;
		}
		setMultipleStartAction(row);
	};

	/** Space — 다중 선택 중 현재 행 추가/해제. 다중 선택 밖에서는 no-op */
	const handleSpaceToggle = (row: number) => {
		const state = useSheetStore.getState();
		const active = state.sheets[state.active];
		if (!active?.multipleActive) return;
		toggleSelectedRowAction(row, false);
	};

	/** 행 추가: 포커스 행 바로 아래 삽입 후 그 행으로 포커스 */
	const handleInsertAtFocus = () => {
		if (isEditing) endEdit(true);
		const insertIndex = insertTimelineAfterAction(resolveFocusRow(), format);
		if (insertIndex == null) return;
		focusAfter(insertIndex, resolveFocusCol());
	};

	/** 행 삭제: 포커스 행 삭제 후 삭제된 위치(또는 이전 행)로 포커스 */
	const handleRemoveAtFocus = () => {
		if (isEditing) endEdit(true);
		const focusRow = removeTimelineAtAction(resolveFocusRow());
		if (focusRow == null) return;
		focusAfter(focusRow, resolveFocusCol());
	};

	/** 다중 선택 툴바 클릭: 편집 커밋 후 다중 선택 on/off (on 시 포커스 행이 앵커) */
	const handleToggleMultipleClick = () => {
		if (isEditing) endEdit(true);
		toggleMultipleAction(resolveFocusRow());
	};

	return {
		multipleActive,
		handleAppendRow,
		handleRowMoved,
		handleSpaceToggle,
		handleInsertAtFocus,
		handleRemoveAtFocus,
		handleToggleMultipleClick,
	};
};

export { useSheetSelectionActions };
