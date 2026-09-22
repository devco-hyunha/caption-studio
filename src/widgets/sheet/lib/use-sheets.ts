import { useRef } from 'react';
import {
	getActiveScroll,
	isEditableColumn,
	useSheetStore,
} from '@/entities/subtitle-sheet';
import type { SheetColumnId, UseSheetsResult } from '../types';
import { getActiveSheetRows, toSheetTabs } from './subtitle-sheets';

/**
 * 탭 전환·CRUD 직전에 현재 body scrollTop을 활성 시트에 기록.
 */
const useSheets = (): UseSheetsResult => {
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

	const persistActiveScroll = () => {
		updateSheetScrollAction(active, bodyScrollTopRef.current);
	};

	const handleScrollTopChange = (scrollTop: number) => {
		bodyScrollTopRef.current = Math.max(0, scrollTop);
	};

	const handleSelectTab = (index: number) => {
		if (index === active) return;

		persistActiveScroll();
		selectSheetAction(index);
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleAddTab = () => {
		persistActiveScroll();
		addSheetAction();
		bodyScrollTopRef.current = 0;
	};

	const handleDeleteTab = (index: number) => {
		persistActiveScroll();
		deleteSheetAction(index);
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleRenameTab = (index: number, name: string) => renameSheetAction(index, name);

	const handleCopyTab = (index: number) => {
		persistActiveScroll();
		copySheetAction(index);
		bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
	};

	const handleUpdateCell = (rowIndex: number, column: SheetColumnId, value: string) => {
		if (!isEditableColumn(column)) return false;
		return updateActiveCellAction(rowIndex, column, value);
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
