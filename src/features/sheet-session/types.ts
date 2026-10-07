import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

/** 히스토리 포커스 좌표 — editable col index (레거시 parity) */
export interface HistoryCursor {
	row: number;
	col: number;
}

export interface HistoryTimelinePatch {
	index: number;
	data: SheetTimelineItem;
}

export type HistoryCommand =
	| 'insert'
	| 'remove'
	| 'update'
	| `multi.${string}`;

/** 레거시 `editHistory` 엔트리 */
export interface HistoryEntry {
	command: HistoryCommand;
	id: number | null;
	before: SheetTimelineItem | HistoryTimelinePatch[] | null;
	after: SheetTimelineItem | HistoryTimelinePatch[] | null;
	current: HistoryCursor;
}

export interface HistoryStack {
	entries: HistoryEntry[];
	index: number;
}

/** 검색 히트 — editable col index */
export interface SearchHit {
	row: number;
	col: number;
}

export type SheetSessionFormat = 'smi' | 'srt';
