import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SheetStore, SheetsState } from '../types';
import {
  createStorage,
  mergeState,
  STORAGE_KEY_SHEETS,
  loadState,
  toSaveState,
} from '../lib/storage/storage';
import { createState } from '../lib/core/sheet-core';
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
  replaceActiveTimelinePatches,
  replaceTimelineAt as replaceActiveTimelineAt,
  replaceTimelinePatches as replaceActiveSelectedTimelinePatches,
  setActiveMultipleStart,
  setActiveTimelines,
  spliceActiveTimelineAt,
  toggleActiveSelectedRow,
  toggleMultiple,
  updateActiveSelectedTexts,
} from '../lib/active/active-sheet';

const getInitialState = (): SheetsState =>
  typeof window !== 'undefined' ? loadState() : createState();

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
        const result = removeActiveTimelineAt(get(), row, true);
        if (!result) return null;
        set(result.state);
        return result.focusRow;
      },

      /** undo/redo 전용 행 삭제 — multipleActive 게이트 없음(M5). 포커스 행 반환 */
      removeTimelineAtForHistory: (row) => {
        const result = removeActiveTimelineAt(get(), row, false);
        if (!result) return null;
        set(result.state);
        return result.focusRow;
      },

      /** 다중 선택 중 선택 행 text에 transform 적용. 반영 없으면 false */
      updateSelectedTexts: (transform) => {
        const next = updateActiveSelectedTexts(get(), transform);
        if (!next) return false;
        set(next);
        return true;
      },

      /** 활성 시트 `row` 타임라인 ms patch. 행 없으면 false */
      patchActiveTimeline: (row, timeline) => {
        const next = replaceActiveTimelineAt(get(), row, timeline);
        if (!next) return false;
        set(next);
        return true;
      },

      /** 다중 선택 중 선택 행 타임라인 ms 일괄 patch. 반영 없으면 false */
      patchSelectedTimelines: (patches) => {
        const next = replaceActiveSelectedTimelinePatches(get(), patches);
        if (!next) return false;
        set(next);
        return true;
      },

      /** undo/redo — 인덱스 삽입(자동 시각 채움 없음) */
      spliceTimelineAt: (index, data) => {
        const next = spliceActiveTimelineAt(get(), index, data);
        if (!next) return false;
        set(next);
        return true;
      },

      /** undo/redo — multi 패치 */
      replaceTimelinePatches: (patches) => {
        const next = replaceActiveTimelinePatches(get(), patches);
        if (!next) return false;
        set(next);
        return true;
      },

      /** import — 활성 탭 timelines 통째 교체 */
      setActiveTimelines: (timelines) => {
        const next = setActiveTimelines(get(), timelines);
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
