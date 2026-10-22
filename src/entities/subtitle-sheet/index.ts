export type {
  SavedSheet,
  SavedState,
  Sheet,
  SheetStore,
  SheetSelectionState,
  SheetTimelineItem,
  TimeSearchAllHit,
  TimeSearchHit,
  TimeSlotIndex,
  EditableColumn,
  SheetsState,
} from './types';

export { EDITABLE_COLUMN_IDS, isEditableColumn } from './lib/column/editable-column';

export {
  createCopyName,
  createTabName,
  isValidTabName,
  normalizeTabName,
} from './lib/core/tab-names';

export {
  cloneTimeline,
  createSheet,
  createState,
  EMPTY_TIMELINES,
  normalizeState,
} from './lib/core/sheet-core';

export {
  addSheet,
  copySheet,
  deleteSheet,
  getActiveScroll,
  renameSheet,
  selectSheet,
  setSmiMeta,
  updateActiveCell,
  updateSheetScroll,
} from './lib/mutate/sheet-mutate';

export {
  createEmptyTimeline,
  fillDefaultTimes,
  insertTimelineAfter,
  insertTimelineAt,
  removeTimelineAt,
  replaceTimelineRow,
  spliceTimelineAt,
} from './lib/mutate/rows-mutate';

export {
  enterMultipleSelection,
  exitMultipleSelection,
  toggleSelectedRow,
} from './lib/selection/sheet-selection';

export {
  patchActiveSheet,
  replaceTimelineAt,
  replaceTimelinePatches,
  replaceActiveTimelinePatches,
  spliceActiveTimelineAt,
  toggleActiveSelectedRow,
  toggleMultiple,
  setActiveMultipleStart,
  insertActiveTimelineAfter,
  removeActiveTimelineAt,
  updateActiveSelectedTexts,
} from './lib/active/active-sheet';

export { loadState } from './lib/storage/storage';

export { resolveEndMs, timeSearch, timeSearchAll } from './lib/time/time-search';

export { resolveStartMs } from './lib/time/time-range';

export { findNextStartNeighborIndex, findPrevStartNeighborIndex } from './lib/time/start-neighbor';

export {
  MINUTE_MS,
  candidateRowIndicesAt,
  cloneTimeSlotIndex,
  insertRowTimeSlot,
  rebuildTimeSlotIndex,
  removeRowTimeSlot,
  shiftTimeSlotIndices,
  syncRowTimeSlot,
} from './lib/time/time-slot-index';

export { useSheetStore } from './model/use-sheet-store';
