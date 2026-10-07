import { create } from 'zustand';
import type {
	HistoryCursor,
	HistoryEntry,
	HistoryStack,
	SearchHit,
	SheetSessionFormat,
} from '../types';
import {
	addStack,
	canRedo,
	canUndo,
	clearStack,
	createEmptyStack,
	getActiveStack,
	insertStackAt,
	nextEntry,
	prevEntry,
	pushEntry,
	removeStackAt,
	resetForSheets,
	setActiveSheetIndex as setActiveIndexState,
} from '../lib/edit-history';
import { applyHistoryRedo, applyHistoryUndo } from '../lib/apply-history-entry';
import {
	canSearchNext,
	canSearchPrev,
	findSearchHits,
	stepSearchIndex,
} from '../lib/sheet-search';

export interface SheetSessionStore {
	stacks: HistoryStack[];
	activeSheetIndex: number;
	searchPanelOpen: boolean;
	searchQuery: string;
	searchHits: SearchHit[];
	searchCurrent: number;
	/** 레거시 `search.state` — 검색 input 포커스 중 에딧 차단 */
	searchInputFocused: boolean;

	resetForSheets: (sheetCount: number, activeIndex?: number) => void;
	setActiveSheetIndex: (index: number) => void;
	addHistoryStack: () => void;
	insertHistoryStackAt: (index: number) => void;
	removeHistoryStackAt: (index: number) => void;
	clearActiveHistory: () => void;

	pushHistory: (entry: HistoryEntry) => void;
	/** 성공 시 포커스할 cursor (레거시 move.event parity) */
	undo: () => HistoryCursor | null;
	redo: () => HistoryCursor | null;
	canUndo: () => boolean;
	canRedo: () => boolean;

	setSearchPanelOpen: (open: boolean) => void;
	toggleSearchPanel: () => void;
	/** 레거시 `closeSearchPanel` — 열려 있을 때만 닫고 hits/query 초기화 */
	closeSearchPanel: () => void;
	/** 탭 전환 시 hits만 비움 (레거시 restoreView) */
	clearSearchHits: () => void;
	setSearchInputFocused: (focused: boolean) => void;
	runSearch: (
		query: string,
		timelines: Parameters<typeof findSearchHits>[0],
		format: SheetSessionFormat,
	) => SearchHit | null;
	searchStep: (direction: 'next' | 'prev') => SearchHit | null;
	canSearchPrev: () => boolean;
	canSearchNext: () => boolean;
}

const useSheetSessionStore = create<SheetSessionStore>((set, get) => ({
	stacks: [createEmptyStack()],
	activeSheetIndex: 0,
	searchPanelOpen: false,
	searchQuery: '',
	searchHits: [],
	searchCurrent: -1,
	searchInputFocused: false,

	resetForSheets: (sheetCount, activeIndex = 0) => {
		set(resetForSheets(sheetCount, activeIndex));
	},

	setActiveSheetIndex: (index) => {
		const { stacks } = get();
		set(setActiveIndexState(index, stacks));
	},

	addHistoryStack: () => {
		set((state) => ({ stacks: addStack(state.stacks) }));
	},

	insertHistoryStackAt: (index) => {
		set((state) => ({ stacks: insertStackAt(state.stacks, index) }));
	},

	removeHistoryStackAt: (index) => {
		set((state) => {
			const next = removeStackAt(state.stacks, index, state.activeSheetIndex);
			return {
				stacks: next.stacks,
				activeSheetIndex: next.activeSheetIndex,
			};
		});
	},

	clearActiveHistory: () => {
		set((state) => {
			const stacks = [...state.stacks];
			stacks[state.activeSheetIndex] = clearStack();
			return { stacks };
		});
	},

	pushHistory: (entry) => {
		set((state) => {
			const active = getActiveStack(state.stacks, state.activeSheetIndex);
			const nextActive = pushEntry(active, entry);
			const stacks = [...state.stacks];
			stacks[state.activeSheetIndex] = nextActive;
			return { stacks };
		});
	},

	undo: () => {
		const state = get();
		const active = getActiveStack(state.stacks, state.activeSheetIndex);
		const result = prevEntry(active);
		if (!result) return null;
		// 레거시: prev() 선반영 후 update 가드 실패해도 스택은 소비
		const focus = applyHistoryUndo(result.entry);
		const stacks = [...state.stacks];
		stacks[state.activeSheetIndex] = result.stack;
		set({ stacks });
		return focus;
	},

	redo: () => {
		const state = get();
		const active = getActiveStack(state.stacks, state.activeSheetIndex);
		const result = nextEntry(active);
		if (!result) return null;
		const focus = applyHistoryRedo(result.entry);
		if (!focus) return null;
		const stacks = [...state.stacks];
		stacks[state.activeSheetIndex] = result.stack;
		set({ stacks });
		return focus;
	},

	canUndo: () => {
		const state = get();
		return canUndo(getActiveStack(state.stacks, state.activeSheetIndex));
	},

	canRedo: () => {
		const state = get();
		return canRedo(getActiveStack(state.stacks, state.activeSheetIndex));
	},

	setSearchPanelOpen: (open) => {
		set({ searchPanelOpen: open });
	},

	toggleSearchPanel: () => {
		set((state) => {
			const open = !state.searchPanelOpen;
			if (!open) {
				return {
					searchPanelOpen: false,
					searchQuery: '',
					searchHits: [],
					searchCurrent: -1,
					searchInputFocused: false,
				};
			}
			return { searchPanelOpen: true };
		});
	},

	closeSearchPanel: () => {
		if (!get().searchPanelOpen) return;
		set({
			searchPanelOpen: false,
			searchQuery: '',
			searchHits: [],
			searchCurrent: -1,
			searchInputFocused: false,
		});
	},

	clearSearchHits: () => {
		set({
			searchHits: [],
			searchCurrent: -1,
		});
	},

	setSearchInputFocused: (focused) => {
		set({ searchInputFocused: focused });
	},

	runSearch: (query, timelines, format) => {
		const normalized = query.toLowerCase();
		const hits = findSearchHits(timelines, normalized, format);
		const searchCurrent = hits.length > 0 ? 0 : -1;
		set({
			searchQuery: query,
			searchHits: hits,
			searchCurrent,
		});
		if (searchCurrent < 0) return null;
		return hits[searchCurrent] ?? null;
	},

	searchStep: (direction) => {
		const state = get();
		const nextIndex = stepSearchIndex(
			state.searchCurrent,
			state.searchHits.length,
			direction,
		);
		set({ searchCurrent: nextIndex });
		if (nextIndex < 0) return null;
		return state.searchHits[nextIndex] ?? null;
	},

	canSearchPrev: () => {
		const state = get();
		return canSearchPrev(state.searchCurrent, state.searchHits.length);
	},

	canSearchNext: () => {
		const state = get();
		return canSearchNext(state.searchCurrent, state.searchHits.length);
	},
}));

export { useSheetSessionStore };
