import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetSearchStore } from '@/features/sheet-search';
import type { SheetRowView } from '../../types';
import { useSheetSearchActions } from './use-sheet-search-actions';

const makeRow = (index: number): SheetRowView => ({
	index,
	starttime: '00:00:00.000',
	endtime: '00:00:00.000',
	dur: '00:00:00.000',
	text: '',
	memo: '',
	height: 24,
});

const makeRows = (count: number) => Array.from({ length: count }, (_, index) => makeRow(index));

const resetSearch = (hits: { row: number; col: number }[]) => {
	useSheetSearchStore.setState({
		searchPanelOpen: true,
		searchHits: hits,
		searchCurrent: hits.length > 0 ? 0 : -1,
		searchInputFocused: false,
		errorSearchActive: false,
	});
};

const renderSearch = (
	hits: { row: number; col: number }[],
	overrides: Partial<Parameters<typeof useSheetSearchActions>[0]> = {},
) => {
	resetSearch(hits);
	const isEditing = vi.fn(() => false);
	const endEdit = vi.fn();
	const applyFocus = vi.fn();
	const hook = renderHook(
		(props: Parameters<typeof useSheetSearchActions>[0]) => useSheetSearchActions(props),
		{
			initialProps: {
				format: 'smi' as const,
				rows: makeRows(3),
				isEditing,
				endEdit,
				applyFocus,
				...overrides,
			},
		},
	);
	return { hook, isEditing, endEdit, applyFocus };
};

describe('useSheetSearchActions', () => {
	beforeEach(() => {
		resetSearch([]);
	});

	it('searchHitKeys — editable col 인덱스를 열 id로 변환. 렌더 밖 행/열은 제외', () => {
		const { hook } = renderSearch([
			{ row: 0, col: 1 },
			{ row: 1, col: 2 },
			{ row: 5, col: 1 },
			{ row: 0, col: 9 },
		]);

		// smi editable: 0=starttime,1=text,2=memo. col9·row5는 렌더 밖 → 제외
		expect(hook.result.current.searchHitKeys).toEqual(new Set(['0:text', '1:memo']));
	});

	it('handleSearchJump — 에딧 중이면 endEdit(true) 후 포커스', () => {
		const { hook, endEdit, applyFocus } = renderSearch([{ row: 1, col: 2 }], {
			isEditing: () => true,
		});

		act(() => hook.result.current.handleSearchJump({ row: 1, col: 2 }));
		expect(endEdit).toHaveBeenCalledWith(true);
		expect(applyFocus).toHaveBeenCalledWith(1, 'memo');
	});

	it('handleSearchJump — 비에딧이면 endEdit 미호출, 포커스만', () => {
		const { hook, endEdit, applyFocus } = renderSearch([{ row: 0, col: 1 }], {
			isEditing: () => false,
		});

		act(() => hook.result.current.handleSearchJump({ row: 0, col: 1 }));
		expect(endEdit).not.toHaveBeenCalled();
		expect(applyFocus).toHaveBeenCalledWith(0, 'text');
	});

	it('handleSearchJump — editable col 범위 밖이면 포커스 미호출', () => {
		const { hook, applyFocus } = renderSearch([{ row: 0, col: 1 }]);

		act(() => hook.result.current.handleSearchJump({ row: 0, col: 9 }));
		expect(applyFocus).not.toHaveBeenCalled();
	});

	it('toggleSearch — 스토어 패널 토글', () => {
		const { hook } = renderSearch([]);

		act(() => hook.result.current.toggleSearch());
		expect(useSheetSearchStore.getState().searchPanelOpen).toBe(false);
	});
});
