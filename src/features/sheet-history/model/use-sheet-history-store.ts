import { create } from 'zustand';
import type { HistoryCursor, HistoryEntry, SheetHistoryStore } from '../types';
import {
	addStack,
	canRedo,
	canUndo,
	createEmptyStack,
	getActiveStack,
	insertStackAt,
	nextEntry,
	prevEntry,
	pushEntry,
	removeStackAt,
	resetActiveStack,
	resetForSheets,
	setActiveSheetIndex as setActiveIndexState,
} from '../lib/edit-history';
import { applyHistoryRedo, applyHistoryUndo } from '../lib/apply-history-entry';

/** 비영속 히스토리 스토어 — 탭별 스택, 검색·시트 persist와 분리 */
const useSheetHistoryStore = create<SheetHistoryStore>((set, get) => ({
	stacks: [createEmptyStack()],
	activeSheetIndex: 0,

	resetForSheets: (sheetCount, activeIndex = 0) => {
		set(resetForSheets(sheetCount, activeIndex));
	},

	resetActiveStack: () => {
		set((state) => ({ stacks: resetActiveStack(state.stacks, state.activeSheetIndex) }));
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

	pushHistory: (entry: HistoryEntry) => {
		set((state) => {
			const active = getActiveStack(state.stacks, state.activeSheetIndex);
			const nextActive = pushEntry(active, entry);
			const stacks = [...state.stacks];
			stacks[state.activeSheetIndex] = nextActive;
			return { stacks };
		});
	},

	undo: (): HistoryCursor | null => {
		const state = get();
		const active = getActiveStack(state.stacks, state.activeSheetIndex);
		const result = prevEntry(active);
		if (!result) return null;
		// prev() 선반영 후 update 가드 실패해도 스택은 소비 (U1)
		const focus = applyHistoryUndo(result.entry);
		const stacks = [...state.stacks];
		stacks[state.activeSheetIndex] = result.stack;
		set({ stacks });
		return focus;
	},

	redo: (): HistoryCursor | null => {
		const state = get();
		const active = getActiveStack(state.stacks, state.activeSheetIndex);
		const result = nextEntry(active);
		if (!result) return null;
		// next() 선소비 — apply 실패해도 스택은 소비 (U1 parity)
		const stacks = [...state.stacks];
		stacks[state.activeSheetIndex] = result.stack;
		set({ stacks });
		return applyHistoryRedo(result.entry);
	},

	canUndo: () => {
		const state = get();
		return canUndo(getActiveStack(state.stacks, state.activeSheetIndex));
	},

	canRedo: () => {
		const state = get();
		return canRedo(getActiveStack(state.stacks, state.activeSheetIndex));
	},
}));

export { useSheetHistoryStore };
