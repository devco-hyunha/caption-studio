/** 다중 선택 순수 로직 — 레거시 `multiple.toggleRow` parity */

export interface SheetSelectionState {
	selectedRows: number[];
	multipleStart: number | null;
}

/**
 * 행 토글 / Shift 범위 추가.
 * - `withShift === false`: 단일 행 토글, start를 해당 행으로
 * - `withShift === true`: start~row 구간의 미선택 행을 추가
 */
const toggleSelectedRow = (
	state: SheetSelectionState,
	row: number,
	withShift: boolean,
): SheetSelectionState => {
	if (!withShift) {
		const currentIndex = state.selectedRows.indexOf(row);
		if (currentIndex === -1) {
			return {
				multipleStart: row,
				selectedRows: [...state.selectedRows, row],
			};
		}
		return {
			multipleStart: row,
			selectedRows: [
				...state.selectedRows.slice(0, currentIndex),
				...state.selectedRows.slice(currentIndex + 1),
			],
		};
	}

	const start = state.multipleStart ?? row;
	const selectionStart = Math.min(start, row);
	const selectionEnd = Math.max(start, row);
	const next = [...state.selectedRows];
	for (let index = selectionStart; index <= selectionEnd; index++) {
		if (next.includes(index)) continue;
		next.push(index);
	}
	return {
		multipleStart: state.multipleStart,
		selectedRows: next,
	};
};

/** multiple 진입 — 현재 행을 시작 선택으로 */
const enterMultipleSelection = (currentRow: number): SheetSelectionState & { multipleActive: true } => {
	const toggled = toggleSelectedRow(
		{ selectedRows: [], multipleStart: currentRow },
		currentRow,
		false,
	);
	return { ...toggled, multipleActive: true };
};

/** multiple 종료 — 선택 해제 */
const exitMultipleSelection = (): SheetSelectionState & { multipleActive: false } => ({
	multipleActive: false,
	multipleStart: null,
	selectedRows: [],
});

export { toggleSelectedRow, enterMultipleSelection, exitMultipleSelection };
