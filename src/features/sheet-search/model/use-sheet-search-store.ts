import { create } from 'zustand';
import { canSearchNext, canSearchPrev, findSearchHits, stepSearchIndex } from '../lib/sheet-search';
import { findErrorHits } from '../lib/error-hits';
import type { SheetSearchStore } from '../types';

const useSheetSearchStore = create<SheetSearchStore>((set, get) => ({
	searchPanelOpen: false,
	searchQuery: '',
	searchHits: [],
	searchCurrent: -1,
	searchInputFocused: false,
	errorSearchActive: false,

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
					errorSearchActive: false,
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
			errorSearchActive: false,
		});
	},

	clearSearchHits: () => {
		set({ searchHits: [], searchCurrent: -1 });
	},

	setSearchInputFocused: (focused) => {
		set({ searchInputFocused: focused });
	},

	runSearch: (query, timelines, format) => {
		const normalized = query.toLowerCase();
		const hits = findSearchHits(timelines, normalized, format);
		const searchCurrent = hits.length > 0 ? 0 : -1;
		set({ searchQuery: query, searchHits: hits, searchCurrent, errorSearchActive: false });
		if (searchCurrent < 0) return null;
		return hits[searchCurrent] ?? null;
	},

	toggleErrorSearch: (rows) => {
		if (!get().errorSearchActive) {
			const hits = findErrorHits(rows);
			set({
				errorSearchActive: true,
				searchQuery: '',
				searchHits: hits,
				searchCurrent: hits.length > 0 ? 0 : -1,
			});
			if (hits.length === 0) return null;
			return hits[0] ?? null;
		}
		// 해제 — hits/query 초기화
		set({ errorSearchActive: false, searchQuery: '', searchHits: [], searchCurrent: -1 });
		return null;
	},

	searchStep: (direction) => {
		const state = get();
		const nextIndex = stepSearchIndex(state.searchCurrent, state.searchHits.length, direction);
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

export { useSheetSearchStore };
