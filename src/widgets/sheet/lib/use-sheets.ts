import { useLayoutEffect, useRef } from 'react';
import {
	getActiveScroll,
	isEditableColumn,
	useSheetStore,
} from '@/entities/subtitle-sheet';
import {
	cloneTimelineSnapshot,
	useSheetSessionStore,
} from '@/features/sheet-session';
import { getEditableColIndex } from './sheet-move';
import type { SheetColumnId, SheetFormat, UseSheetsResult } from '../types';
import { getActiveSheetRows, toSheetTabs } from './subtitle-sheets';

/**
 * 탭 전환·CRUD 직전에 현재 body scrollTop을 활성 시트에 기록.
 * 셀 커밋 시 history push · 탭 CRUD 시 history 스택 동기화.
 */
const useSheets = (format: SheetFormat): UseSheetsResult => {
	const active = useSheetStore((state) => state.active);
	const sheets = useSheetStore((state) => state.sheets);
	const selectSheetAction = useSheetStore((state) => state.selectSheet);
	const addSheetAction = useSheetStore((state) => state.addSheet);
	const deleteSheetAction = useSheetStore((state) => state.deleteSheet);
	const renameSheetAction = useSheetStore((state) => state.renameSheet);
	const copySheetAction = useSheetStore((state) => state.copySheet);
	const updateActiveCellAction = useSheetStore((state) => state.updateActiveCell);
	const updateSheetScrollAction = useSheetStore((state) => state.updateSheetScroll);

	const state = { active, sheets };
	const bodyScrollTopRef = useRef(getActiveScroll(state));

	useLayoutEffect(() => {
		useSheetSessionStore.getState().resetForSheets(sheets.length, active);
		// 최초 마운트만 — 탭 CRUD는 핸들러에서 스택 동기화
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount sync only
	}, []);

	const persistActiveScroll = () => {
		updateSheetScrollAction(active, bodyScrollTopRef.current);
	};

	const handleScrollTopChange = (scrollTop: number) => {
		bodyScrollTopRef.current = Math.max(0, scrollTop);
	};

	const clearSearchHits = () => {
		useSheetSessionStore.getState().clearSearchHits();
	};

	const handleSelectTab = (index: number) => {
		if (index === active) return;

		persistActiveScroll();
		selectSheetAction(index);
		useSheetSessionStore.getState().setActiveSheetIndex(index);
		// 레거시 restoreView — searchHits 초기화
		clearSearchHits();
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleAddTab = () => {
		persistActiveScroll();
		addSheetAction();
		useSheetSessionStore.getState().addHistoryStack();
		const nextActive = useSheetStore.getState().active;
		useSheetSessionStore.getState().setActiveSheetIndex(nextActive);
		clearSearchHits();
		bodyScrollTopRef.current = 0;
	};

	const handleDeleteTab = (index: number) => {
		persistActiveScroll();
		const beforeCount = useSheetStore.getState().sheets.length;
		deleteSheetAction(index);
		const afterCount = useSheetStore.getState().sheets.length;
		if (afterCount < beforeCount) {
			useSheetSessionStore.getState().removeHistoryStackAt(index);
		}
		clearSearchHits();
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleRenameTab = (index: number, name: string) => renameSheetAction(index, name);

	const handleCopyTab = (index: number) => {
		persistActiveScroll();
		copySheetAction(index);
		useSheetSessionStore.getState().insertHistoryStackAt(index + 1);
		const nextActive = useSheetStore.getState().active;
		useSheetSessionStore.getState().setActiveSheetIndex(nextActive);
		clearSearchHits();
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleUpdateCell = (rowIndex: number, column: SheetColumnId, value: string) => {
		if (!isEditableColumn(column)) return false;

		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		const before = sheet?.timelines[rowIndex];
		if (!before) return false;

		// 레거시 command.update — mutate 전 검색 패널 닫기
		useSheetSessionStore.getState().closeSearchPanel();

		const beforeSnap = cloneTimelineSnapshot(before);
		const ok = updateActiveCellAction(rowIndex, column, value);
		if (!ok) return false;

		const after = useSheetStore.getState().sheets[store.active]?.timelines[rowIndex];
		if (!after) return true;

		const col = getEditableColIndex(format, column);
		useSheetSessionStore.getState().pushHistory({
			command: 'update',
			id: rowIndex,
			before: beforeSnap,
			after: cloneTimelineSnapshot(after),
			current: { row: rowIndex, col: col >= 0 ? col : 0 },
		});
		return true;
	};

	return {
		tabs: toSheetTabs(sheets),
		activeTabIndex: active,
		rows: getActiveSheetRows(state),
		activeScrollTop: getActiveScroll(state),
		handleScrollTopChange,
		handleSelectTab,
		handleAddTab,
		handleDeleteTab,
		handleRenameTab,
		handleCopyTab,
		handleUpdateCell,
	};
};

export { useSheets };
