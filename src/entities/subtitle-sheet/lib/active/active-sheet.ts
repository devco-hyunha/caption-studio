/** 활성 시트 다중 선택 / 행 CRUD / import 래퍼 — SheetsState 변경은 entities 책임 */
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { Sheet, SheetTimelineItem, SheetsState } from '../../types';
import { cloneTimeline } from '../core/sheet-core';
import {
  enterMultipleSelection,
  exitMultipleSelection,
  toggleSelectedRow,
} from '../selection/sheet-selection';
import {
  insertTimelineAfter,
  removeTimelineAt,
  replaceTimelineRow,
  spliceTimelineAt,
} from '../mutate/rows-mutate';

/** 활성 시트 조회 — 없으면 undefined */
const getActiveSheet = (state: SheetsState): Sheet | undefined => state.sheets[state.active];

/** 활성 시트만 patch. patch가 같은 시트를 돌려주면 변경 없음(null) */
const patchActiveSheet = (
  state: SheetsState,
  patch: (sheet: Sheet) => Sheet | null,
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet) return null;
  const nextSheet = patch(sheet);
  if (!nextSheet || nextSheet === sheet) return null;
  return {
    ...state,
    sheets: [
      ...state.sheets.slice(0, state.active),
      nextSheet,
      ...state.sheets.slice(state.active + 1),
    ],
  };
};

/** patch 없으면 원본 state 유지 — selection 계열의 `next ?? state` 근원 */
const patchActiveSheetKeep = (
  state: SheetsState,
  patch: (sheet: Sheet) => Sheet | null,
): SheetsState => patchActiveSheet(state, patch) ?? state;

/** multiple 모드 on/off */
const toggleMultiple = (state: SheetsState, currentRow: number): SheetsState => {
  const sheet = getActiveSheet(state);
  if (!sheet) return state;

  const nextSelection = sheet.multipleActive
    ? exitMultipleSelection()
    : enterMultipleSelection(Math.max(0, currentRow));

  return patchActiveSheetKeep(state, (active) => ({
    ...active,
    ...nextSelection,
  }));
};

/** Space / Shift 범위. multiple 아니면 no-op */
const toggleActiveSelectedRow = (
  state: SheetsState,
  row: number,
  withShift: boolean,
): SheetsState => {
  const sheet = getActiveSheet(state);
  if (!sheet?.multipleActive) return state;

  const nextSelection = toggleSelectedRow(
    { selectedRows: sheet.selectedRows, multipleStart: sheet.multipleStart },
    row,
    withShift,
  );
  return patchActiveSheetKeep(state, (active) => ({
    ...active,
    selectedRows: nextSelection.selectedRows,
    multipleStart: nextSelection.multipleStart,
  }));
};

/** multiple 이동(비-Shift) 앵커 */
const setActiveMultipleStart = (state: SheetsState, row: number): SheetsState => {
  const sheet = getActiveSheet(state);
  if (!sheet?.multipleActive) return state;
  if (sheet.multipleStart === row) return state;
  return patchActiveSheetKeep(state, (active) => ({
    ...active,
    multipleStart: row,
  }));
};

/**
 * 행 삽입. multiple 중이면 null.
 * 성공 시 `{ state, insertIndex }`.
 */
const insertActiveTimelineAfter = (
  state: SheetsState,
  row: number,
  format: SubtitleFormat,
): { state: SheetsState; insertIndex: number } | null => {
  const sheet = getActiveSheet(state);
  if (!sheet || sheet.multipleActive) return null;

  const { timelines, insertIndex } = insertTimelineAfter(sheet.timelines, row, format);
  const next = patchActiveSheet(state, (active) => ({
    ...active,
    timelines,
    selectedRows: [],
    multipleStart: null,
  }));
  if (!next) return null;
  return { state: next, insertIndex };
};

/**
 * multiple 선택 행의 text에 transform 적용.
 * multiple이 아니거나 선택 없으면 null.
 */
const updateActiveSelectedTexts = (
  state: SheetsState,
  transform: (text: string, rowIndex: number) => string,
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet?.multipleActive) return null;
  if (sheet.selectedRows.length === 0) return null;

  let changed = false;
  const timelines = sheet.timelines.map((timeline, index) => {
    if (!sheet.selectedRows.includes(index)) return timeline;
    const prev = typeof timeline.text === 'string' ? timeline.text : '';
    const nextText = transform(prev, index);
    if (nextText === prev) return timeline;
    changed = true;
    return { ...timeline, text: nextText };
  });

  if (!changed) return null;

  return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/**
 * 행 삭제. 성공 시 `{ state, focusRow }`.
 * `clearSelection`(normal): multiple 중이면 null + 선택 초기화.
 * `clearSelection`(history, false): 게이트 없음, 선택 유지 (M5 — 스택·데이터 함께 이동).
 */
const removeActiveTimelineAt = (
  state: SheetsState,
  row: number,
  clearSelection: boolean,
): { state: SheetsState; focusRow: number } | null => {
  const sheet = getActiveSheet(state);
  if (!sheet) return null;
  if (clearSelection && sheet.multipleActive) return null;

  const result = removeTimelineAt(sheet.timelines, row);
  if (!result) return null;

  const next = patchActiveSheet(state, (active) => ({
    ...active,
    timelines: result.timelines,
    ...(clearSelection ? { selectedRows: [], multipleStart: null } : {}),
  }));
  if (!next) return null;
  return { state: next, focusRow: result.focusRow };
};

/**
 * 활성 시트 `row`의 타임라인을 `timeline`으로 교체. ms 값 직접 patch.
 * 행이 없으면 null.
 */
const replaceTimelineAt = (
  state: SheetsState,
  row: number,
  timeline: SheetTimelineItem,
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet?.timelines[row]) return null;

  const timelines = [
    ...sheet.timelines.slice(0, row),
    cloneTimeline(timeline),
    ...sheet.timelines.slice(row + 1),
  ];
  return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/**
 * multiple 선택 행의 타임라인을 patch 맵(`rowIndex → timeline`)으로 일괄 교체.
 * multiple이 아니거나 선택·patch 없으면 null.
 */
const replaceTimelinePatches = (
  state: SheetsState,
  patches: Map<number, SheetTimelineItem>,
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet?.multipleActive) return null;
  if (sheet.selectedRows.length === 0 || patches.size === 0) return null;

  let changed = false;
  const timelines = sheet.timelines.map((timeline, index) => {
    const patch = patches.get(index);
    if (patch == null) return timeline;
    changed = true;
    return cloneTimeline(patch);
  });

  if (!changed) return null;
  return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/**
 * undo/redo용 — `index`에 타임라인 삽입 (기본 시각 채움 없음).
 * `/` `history.js` parity: undo는 선택 상태를 건드리지 않는다 (M2).
 */
const spliceActiveTimelineAt = (
  state: SheetsState,
  index: number,
  data: SheetTimelineItem,
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet) return null;
  const timelines = spliceTimelineAt(sheet.timelines, index, data);
  return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/**
 * undo/redo용 multi 패치 — multiple 여부와 무관하게 `{ index, data }[]` 일괄 교체.
 */
const replaceActiveTimelinePatches = (
  state: SheetsState,
  patches: readonly { index: number; data: SheetTimelineItem }[],
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet || patches.length === 0) return null;

  let timelines = sheet.timelines;
  let changed = false;
  for (const patch of patches) {
    const next = replaceTimelineRow(timelines, patch.index, patch.data);
    if (!next) continue;
    timelines = next;
    changed = true;
  }
  if (!changed) return null;
  return patchActiveSheet(state, (active) => ({ ...active, timelines }));
};

/**
 * import — 활성 탭 timelines 통째 교체. 빈 배열은 빈 행 1개.
 * 스크롤·다중 선택·포커스 초기화.
 */
const setActiveTimelines = (
  state: SheetsState,
  timelines: readonly SheetTimelineItem[],
): SheetsState | null => {
  const sheet = getActiveSheet(state);
  if (!sheet) return null;

  const nextTimelines =
    timelines.length === 0 ? [cloneTimeline()] : timelines.map((item) => cloneTimeline(item));

  return patchActiveSheet(state, (active) => ({
    ...active,
    timelines: nextTimelines,
    scroll: 0,
    selectedRows: [],
    multipleActive: false,
    multipleStart: null,
    current: {},
  }));
};

export {
  patchActiveSheet,
  replaceTimelineAt,
  replaceTimelinePatches,
  replaceActiveTimelinePatches,
  spliceActiveTimelineAt,
  toggleMultiple,
  toggleActiveSelectedRow,
  setActiveMultipleStart,
  insertActiveTimelineAfter,
  removeActiveTimelineAt,
  updateActiveSelectedTexts,
  setActiveTimelines,
};
