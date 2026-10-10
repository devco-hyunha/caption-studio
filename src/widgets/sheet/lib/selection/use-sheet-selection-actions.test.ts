import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSheetStore } from '@/entities/subtitle-sheet';
import type { SheetRowView } from '../../types';
import { useSheetSelectionActions } from './use-sheet-selection-actions';

const ROW_HEIGHT = 24;

const makeRow = (index: number): SheetRowView => ({
	index,
	starttime: '00:00:00.000',
	endtime: '00:00:00.000',
	dur: '00:00:00.000',
	text: '',
	memo: '',
	height: ROW_HEIGHT,
});

const makeRows = (count: number) =>
	Array.from({ length: count }, (_, index) => makeRow(index));

const resetStore = (rowCount: number) => {
	useSheetStore.setState({
		active: 0,
		sheets: [
			{
				name: 'sheet1',
				timelines: Array.from({ length: rowCount }, () => ({
					start: 0,
					end: 0,
					text: '',
					memo: '',
				})),
				smiName: '',
				smiLang: '',
				scroll: 0,
				current: {},
				selectedRows: [],
				multipleActive: false,
				multipleStart: null,
			},
		],
	});
};

const renderActions = (
	rowCount: number,
	overrides: Partial<Parameters<typeof useSheetSelectionActions>[0]> = {},
) => {
	resetStore(rowCount);
	const applyFocus = vi.fn();
	const endEdit = vi.fn();
	const initialProps = {
		format: 'smi' as const,
		rows: makeRows(rowCount),
		totalHeight: rowCount * ROW_HEIGHT,
		isEditing: false,
		currentRowIndex: 1,
		currentColumn: 'text' as const,
		endEdit,
		applyFocus,
		...overrides,
	};
	const hook = renderHook(
		(props: Parameters<typeof useSheetSelectionActions>[0]) =>
			useSheetSelectionActions(props),
		{ initialProps },
	);
	const rerender = (rowCount: number, totalHeight = rowCount * ROW_HEIGHT) =>
		hook.rerender({
			format: 'smi',
			rows: makeRows(rowCount),
			totalHeight,
			isEditing: initialProps.isEditing,
			currentRowIndex: initialProps.currentRowIndex,
			currentColumn: 'text',
			endEdit,
			applyFocus,
		});
	return { hook, applyFocus, endEdit, rerender };
};

const activeSheet = () =>
	useSheetStore.getState().sheets[useSheetStore.getState().active];

describe('useSheetSelectionActions', () => {
	beforeEach(() => {
		resetStore(3);
	});

	it('토글 클릭: 다중 선택 진입 시 현재 행 선택, 재토글 시 해제', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleToggleMultipleClick());
		expect(activeSheet().multipleActive).toBe(true);
		expect(activeSheet().selectedRows).toEqual([1]);
		expect(hook.result.current.multipleActive).toBe(true);

		act(() => hook.result.current.handleToggleMultipleClick());
		expect(activeSheet().multipleActive).toBe(false);
		expect(activeSheet().selectedRows).toEqual([]);
	});

	it('다중 선택 밖에서는 행 이동 핸들러가 동작하지 않는다', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleRowMoved(2, true));
		expect(activeSheet().selectedRows).toEqual([]);
		expect(activeSheet().multipleStart).toBeNull();
	});

	it('다중 선택 중 Shift 이동: 앵커~행 범위 합집합', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleToggleMultipleClick());
		act(() => hook.result.current.handleRowMoved(2, true));
		expect(activeSheet().selectedRows).toEqual([1, 2]);

		act(() => hook.result.current.handleRowMoved(0, true));
		expect(activeSheet().selectedRows).toEqual([1, 2, 0]);
	});

	it('다중 선택 중 이동(비Shift): 앵커만 이동', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleToggleMultipleClick());
		act(() => hook.result.current.handleRowMoved(2, false));
		expect(activeSheet().multipleStart).toBe(2);
		expect(activeSheet().selectedRows).toEqual([1]);
	});

	it('Space: 다중 선택 중 현재 행 토글 + 앵커 이동', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleToggleMultipleClick());
		act(() => hook.result.current.handleSpaceToggle(2));
		expect(activeSheet().selectedRows).toEqual([1, 2]);
		expect(activeSheet().multipleStart).toBe(2);

		act(() => hook.result.current.handleSpaceToggle(2));
		expect(activeSheet().selectedRows).toEqual([1]);
	});

	it('Space: 다중 선택 밖에서는 동작하지 않는다', () => {
		const { hook } = renderActions(3);

		act(() => hook.result.current.handleSpaceToggle(2));
		expect(activeSheet().selectedRows).toEqual([]);
		expect(activeSheet().multipleStart).toBeNull();
	});

	it('행 추가: 렌더 반영 후 포커스 지연 적용 (미반영 시 보류)', () => {
		const { hook, applyFocus, rerender } = renderActions(3, { totalHeight: 10 });

		act(() => hook.result.current.handleInsertAtFocus());
		expect(activeSheet().timelines).toHaveLength(4);
		// totalHeight가 새 행을 반영하지 못하면 포커스 보류
		expect(applyFocus).not.toHaveBeenCalled();

		rerender(4);
		expect(applyFocus).toHaveBeenCalledWith(2, 'text');
	});

	it('Tab append: 커서 행 아래 삽입 후 커서 열로 포커스', () => {
		const { hook, applyFocus, rerender } = renderActions(3);

		act(() => hook.result.current.handleAppendRow({ row: 1, col: 1 }));
		expect(activeSheet().timelines).toHaveLength(4);

		rerender(4);
		expect(applyFocus).toHaveBeenCalledWith(2, 'text');
	});

	it('행 삭제: 클램프된 포커스 행으로 이동', () => {
		const { hook, applyFocus, rerender } = renderActions(3, { currentRowIndex: 2 });

		act(() => hook.result.current.handleRemoveAtFocus());
		expect(activeSheet().timelines).toHaveLength(2);

		rerender(2);
		expect(applyFocus).toHaveBeenCalledWith(1, 'text');
	});

	it('다중 선택 중 행 추가/삭제: 스토어 null 반환, 포커스 이동 없음', () => {
		const { hook, applyFocus } = renderActions(3);

		act(() => hook.result.current.handleToggleMultipleClick());
		act(() => hook.result.current.handleInsertAtFocus());
		act(() => hook.result.current.handleRemoveAtFocus());
		expect(activeSheet().timelines).toHaveLength(3);
		expect(applyFocus).not.toHaveBeenCalled();
	});

	it('편집 중이면 액션 전에 endEdit(true) 호출', () => {
		const { hook, endEdit } = renderActions(3, { isEditing: true });

		act(() => hook.result.current.handleInsertAtFocus());
		expect(endEdit).toHaveBeenCalledWith(true);

		act(() => hook.result.current.handleToggleMultipleClick());
		expect(endEdit).toHaveBeenCalledTimes(2);
	});
});
