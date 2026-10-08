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
	insertActiveTimelineAfter,
	loadState,
	removeActiveTimelineAt,
	toSaveState,
	renameSheet,
	replaceActiveTimelineAt,
	replaceActiveTimelinePatches,
	selectSheet,
	setActiveMultipleStart,
	setActiveTimelines as replaceActiveSheetTimelines,
	spliceActiveTimelineAt,
	toggleActiveSelectedRow,
	toggleMultiple,
	updateActiveCell,
	updateSelectedRowTexts,
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

			toggleMultiple: (currentRow) => {
				set((state) => toggleMultiple(state, currentRow));
			},

			toggleSelectedRow: (row, withShift) => {
				set((state) => toggleActiveSelectedRow(state, row, withShift));
			},

			setMultipleStart: (row) => {
				set((state) => setActiveMultipleStart(state, row));
			},

			insertTimelineAfter: (row, format) => {
				const result = insertActiveTimelineAfter(get(), row, format);
				if (!result) return null;
				set(result.state);
				return result.insertIndex;
			},

			removeTimelineAt: (row) => {
				const result = removeActiveTimelineAt(get(), row);
				if (!result) return null;
				set(result.state);
				return result.focusRow;
			},

			updateSelectedTexts: (transform) => {
				const next = updateSelectedRowTexts(get(), transform);
				if (!next) return false;
				set(next);
				return true;
			},

			replaceTimelineAt: (row, data) => {
				const next = replaceActiveTimelineAt(get(), row, data);
				if (!next) return false;
				set(next);
				return true;
			},

			spliceTimelineAt: (index, data) => {
				const next = spliceActiveTimelineAt(get(), index, data);
				if (!next) return false;
				set(next);
				return true;
			},

			replaceTimelinePatches: (patches) => {
				const next = replaceActiveTimelinePatches(get(), patches);
				if (!next) return false;
				set(next);
				return true;
			},

			setActiveTimelines: (timelines) => {
				const next = replaceActiveSheetTimelines(get(), timelines);
				if (!next) return false;
				set(next);
				return true;
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
