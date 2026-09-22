import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SheetStore, SheetsState } from '../types';
import {
	createStorage,
	mergeState,
} from '../lib/storage';
import {
	STORAGE_KEY_SHEETS,
	addSheet,
	copySheet,
	createState,
	deleteSheet,
	loadState,
	toSaveState,
	renameSheet,
	selectSheet,
	updateActiveCell,
	updateSheetScroll,
} from '../lib/subtitle-sheets';

const getInitialState = (): SheetsState =>
	typeof window !== 'undefined'
		? loadState()
		: createState();

const useSheetStore = create<SheetStore>()(
	persist(
		(set, get) => ({
			...getInitialState(),

			selectSheet: (index) => {
				set((state) => selectSheet(state, index));
			},

			addSheet: () => {
				set((state) => addSheet(state));
			},

			deleteSheet: (index) => {
				set((state) => deleteSheet(state, index));
			},

			renameSheet: (index, name) => {
				const next = renameSheet(get(), index, name);
				if (!next) return false;
				set(next);
				return true;
			},

			copySheet: (index) => {
				set((state) => copySheet(state, index));
			},

			updateActiveCell: (rowIndex, column, value) => {
				const next = updateActiveCell(get(), rowIndex, column, value);
				if (!next) return false;
				set(next);
				return true;
			},

			updateSheetScroll: (index, scrollTop) => {
				set((state) => updateSheetScroll(state, index, scrollTop));
			},
		}),
		{
			name: STORAGE_KEY_SHEETS,
			storage: createJSONStorage(() => createStorage()),
			/** 저장용 strip 단일 지점 — `storage.setItem`에서는 재호출하지 않음 */
			partialize: (state) =>
				toSaveState({
					active: state.active,
					sheets: state.sheets,
				}),
			merge: (persisted, current) => ({
				...current,
				...mergeState(persisted, {
					active: current.active,
					sheets: current.sheets,
				}),
			}),
		},
	),
);

export { useSheetStore };
