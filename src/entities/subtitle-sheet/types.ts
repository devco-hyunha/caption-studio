/** `subtitleSheets` 타임라인 행 */
export interface SheetTimelineItem {
	start?: number;
	end?: number;
	sync?: number;
	text?: string;
	memo?: string;
}

/** `subtitleSheets.sheets[]` 항목 (런타임) */
export interface Sheet {
	name: string;
	timelines: SheetTimelineItem[];
	smiName: string;
	smiLang: string;
	scroll: number;
	current: Record<string, unknown>;
	selectedRows: number[];
}

/** in-memory / Zustand 스토어 스키마 */
export interface SheetsState {
	active: number;
	sheets: Sheet[];
}

/** localStorage에 기록되는 시트 */
export interface SavedSheet {
	name: string;
	timelines: SheetTimelineItem[];
	smiName: string;
	smiLang: string;
}

/** localStorage `subtitleSheets` 저장 스키마 */
export interface SavedState {
	active: number;
	sheets: SavedSheet[];
}

export type EditableColumn = 'text' | 'memo' | 'starttime' | 'endtime';

/** Zustand 스토어 — 상태 + 액션 */
export interface SheetStore extends SheetsState {
	selectSheet: (index: number) => void;
	addSheet: () => void;
	deleteSheet: (index: number) => void;
	renameSheet: (index: number, name: string) => boolean;
	copySheet: (index: number) => void;
	updateActiveCell: (
		rowIndex: number,
		column: EditableColumn,
		value: string,
	) => boolean;
	updateSheetScroll: (index: number, scrollTop: number) => void;
}
