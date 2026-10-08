export type {
	SavedSheet,
	SavedState,
	Sheet,
	SheetTimelineFormat,
	SheetTimelineItem,
	TimeSearchAllHit,
	TimeSearchHit,
	TimeSlotIndex,
	EditableColumn,
	SheetsState,
} from './types';

export { EDITABLE_COLUMN_IDS, isEditableColumn } from './lib/editable-column';

export {
	TAB_NAME_RE,
	createCopyName,
	createTabName,
	isValidTabName,
	normalizeTabName,
} from './lib/tab-names';

export {
	enterMultipleSelection,
	exitMultipleSelection,
	toggleSelectedRow,
} from './lib/sheet-selection';

export {
	cloneTimeline,
	createEmptyTimeline,
	fillDefaultTimes,
	insertTimelineAfter,
	insertTimelineAt,
	removeTimelineAt,
	replaceTimelineAt,
	spliceTimelineAt,
} from './lib/sheet-mutate';

export { OPEN_END_MS, resolveEndMs, timeSearch, timeSearchAll } from './lib/time-search';

export { resolveStartMs } from './lib/time-range';

export {
	findNextStartNeighborIndex,
	findPrevStartNeighborIndex,
} from './lib/start-neighbor';

export {
	MINUTE_MS,
	candidateRowIndicesAt,
	insertRowTimeSlot,
	rebuildTimeSlotIndex,
	removeRowTimeSlot,
	shiftTimeSlotIndices,
	syncRowTimeSlot,
} from './lib/time-slot-index';

export {
	addSheet,
	copySheet,
	createSheet,
	createState,
	deleteSheet,
	getActiveScroll,
	insertActiveTimelineAfter,
	loadState,
	normalizeState,
	removeActiveTimelineAt,
	renameSheet,
	replaceActiveTimelineAt,
	replaceActiveTimelinePatches,
	selectSheet,
	setActiveMultipleStart,
	setActiveTimelines,
	spliceActiveTimelineAt,
	toggleActiveSelectedRow,
	toggleMultiple,
	updateActiveCell,
	updateSelectedRowTexts,
	updateSheetScroll,
} from './lib/subtitle-sheets';

export { useSheetStore } from './model/use-sheet-store';
