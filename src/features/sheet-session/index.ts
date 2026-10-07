export type {
	HistoryCommand,
	HistoryCursor,
	HistoryEntry,
	HistoryStack,
	HistoryTimelinePatch,
	SearchHit,
	SheetSessionFormat,
} from './types';

export {
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
	setActiveSheetIndex,
} from './lib/edit-history';

export {
	TEXT_MEMO_COLS,
	canSearchNext,
	canSearchPrev,
	findSearchHits,
	stepSearchIndex,
} from './lib/sheet-search';

export {
	applyHistoryRedo,
	applyHistoryUndo,
	cloneTimelineSnapshot,
	emptyTimelineSnapshot,
	timelineSnapshotEquals,
} from './lib/apply-history-entry';

export {
	useSheetSessionStore,
	type SheetSessionStore,
} from './model/use-sheet-session-store';

export { SheetSearchPanel } from './ui/sheet-search-panel';
export type { SheetSearchPanelProps } from './ui/sheet-search-panel';
