import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SheetStore, SheetsState } from '../types';
import {
	createStorage,
	mergeState,
	STORAGE_KEY_SHEETS,
	loadState,
	toSaveState,
} from '../lib/storage';
import { createState } from '../lib/sheet-core';
import {
	addSheet,
	copySheet,
	deleteSheet,
	renameSheet,
	selectSheet,
	updateActiveCell,
	updateSheetScroll,
} from '../lib/mutate/sheet-mutate';
import {
	insertActiveTimelineAfter,
	removeActiveTimelineAt,
	setActiveMultipleStart,
	toggleActiveSelectedRow,
	toggleMultiple,
} from '../lib/active-sheet';

const getInitialState = (): SheetsState =>
	typeof window !== 'undefined'
		? loadState()
		: createState();

/** 시트 스토어 — localStorage 영속, 다중 선택/행 CRUD는 런타임 전용(영속 제외) */
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

			/** 이름 바꾸기 — 중복·불법 이름이면 false */
			renameSheet: (index, name) => {
				const next = renameSheet(get(), index, name);
				if (!next) return false;
				set(next);
				return true;
			},

			copySheet: (index) => {
				set((state) => copySheet(state, index));
			},

			/** 셀 값 갱신 — timecode 파싱 실패 시 false */
			updateActiveCell: (rowIndex, column, value) => {
				const next = updateActiveCell(get(), rowIndex, column, value);
				if (!next) return false;
				set(next);
				return true;
			},

			updateSheetScroll: (index, scrollTop) => {
				set((state) => updateSheetScroll(state, index, scrollTop));
			},

			/** 다중 선택 on/off — on 시 currentRow가 앵커 */
			toggleMultiple: (currentRow) => {
				set((state) => toggleMultiple(state, currentRow));
			},

			/** 행 선택 토글 — 다중 선택 중일 때만 반영. Shift: 선택 추가 */
			toggleSelectedRow: (row, withShift) => {
				set((state) => toggleActiveSelectedRow(state, row, withShift));
			},

			/** 다중 선택 앵커 이동 — 다중 선택 중일 때만 */
			setMultipleStart: (row) => {
				set((state) => setActiveMultipleStart(state, row));
			},

			/** 행 삽입 — `row` 바로 뒤. 삽입 인덱스 반환, 실패 시 null */
			insertTimelineAfter: (row, format) => {
				const result = insertActiveTimelineAfter(get(), row, format);
				if (!result) return null;
				set(result.state);
				return result.insertIndex;
			},

			/** 행 삭제 — 삭제 후 포커스할 행 반환(마지막 행이면 이전 행), 실패 시 null */
			removeTimelineAt: (row) => {
				const result = removeActiveTimelineAt(get(), row);
				if (!result) return null;
				set(result.state);
				return result.focusRow;
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
