import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetSearchStore } from '@/features/sheet-search';
import { useSheets } from './use-sheets';

const resetSheets = (count: number) => {
	useSheetStore.setState({
		active: 0,
		sheets: Array.from({ length: count }, (_, index) => ({
			name: `sheet${index + 1}`,
			timelines: [{ start: 0, end: 1000, text: 'A', memo: '' }],
			smiName: '',
			smiLang: '',
			scroll: 0,
			current: {},
			selectedRows: [],
			multipleActive: false,
			multipleStart: null,
		})),
	});
};

const resetSearch = () => {
	useSheetSearchStore.setState({
		searchPanelOpen: true,
		searchHits: [{ row: 0, col: 1 }],
		searchCurrent: 0,
		searchInputFocused: false,
		errorSearchActive: false,
	});
};

describe('useSheets clearSearchHits', () => {
	beforeEach(() => {
		resetSheets(2);
		resetSearch();
	});

	it('탭 전환 — hits·current clear, panel은 유지', () => {
		const { result } = renderHook(() => useSheets('smi'));

		act(() => result.current.handleSelectTab(1));
		const state = useSheetSearchStore.getState();
		expect(state.searchHits).toEqual([]);
		expect(state.searchCurrent).toBe(-1);
		expect(state.searchPanelOpen).toBe(true);
	});

	it('탭 추가·복사·삭제 — hits clear', () => {
		const { result } = renderHook(() => useSheets('smi'));

		act(() => result.current.handleAddTab());
		expect(useSheetSearchStore.getState().searchHits).toEqual([]);

		resetSearch();
		act(() => result.current.handleCopyTab(0));
		expect(useSheetSearchStore.getState().searchHits).toEqual([]);

		resetSearch();
		act(() => result.current.handleDeleteTab(1));
		expect(useSheetSearchStore.getState().searchHits).toEqual([]);
	});

	it('같은 탭 재선택 — hits 유지', () => {
		const { result } = renderHook(() => useSheets('smi'));

		act(() => result.current.handleSelectTab(0));
		expect(useSheetSearchStore.getState().searchHits).toEqual([{ row: 0, col: 1 }]);
	});
});
