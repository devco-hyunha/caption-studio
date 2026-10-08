/** `subtitleSheets` 타임라인 행 */
export interface SheetTimelineItem {
	start?: number;
	end?: number;
	sync?: number;
	text?: string;
	memo?: string;
}

/** insert/remove 시각 채움용 — 위젯 SheetFormat과 동일 유니온 */
export type SheetTimelineFormat = 'smi' | 'srt';

/** `subtitleSheets.sheets[]` 항목 (런타임) */
export interface Sheet {
	name: string;
	timelines: SheetTimelineItem[];
	smiName: string;
	smiLang: string;
	scroll: number;
	current: Record<string, unknown>;
	/** 영속 제외 — multiple 선택 행 */
	selectedRows: number[];
	/** 영속 제외 — multiple 모드 */
	multipleActive: boolean;
	/** 영속 제외 — Shift 범위 선택 앵커 */
	multipleStart: number | null;
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
	/** multiple 모드 토글. `currentRow`는 진입 시 시작 행 */
	toggleMultiple: (currentRow: number) => void;
	/** Space / Shift 범위 선택. multiple 모드에서만 유효 */
	toggleSelectedRow: (row: number, withShift: boolean) => void;
	/** multiple 중 이동(비-Shift) 시 앵커만 갱신 */
	setMultipleStart: (row: number) => void;
	/**
	 * 현재 행 뒤 삽입. 성공 시 새 행 인덱스.
	 * multiple 중이면 null.
	 */
	insertTimelineAfter: (row: number, format: SheetTimelineFormat) => number | null;
	/**
	 * 행 삭제(마지막 1행은 비우기). 성공 시 포커스할 행.
	 * multiple 중이면 null.
	 */
	removeTimelineAt: (row: number) => number | null;
	/**
	 * multiple 선택 행 text transform.
	 * 성공 여부.
	 */
	updateSelectedTexts: (transform: (text: string, rowIndex: number) => string) => boolean;
	/** undo/redo — 한 행 교체 */
	replaceTimelineAt: (row: number, data: SheetTimelineItem) => boolean;
	/** undo/redo — 인덱스 삽입(자동 시각 채움 없음) */
	spliceTimelineAt: (index: number, data: SheetTimelineItem) => boolean;
	/** undo/redo — multi 패치 */
	replaceTimelinePatches: (
		patches: readonly { index: number; data: SheetTimelineItem }[],
	) => boolean;
	/** import — 활성 탭 timelines 통째 교체 (multiple·스크롤 초기화) */
	setActiveTimelines: (timelines: readonly SheetTimelineItem[]) => boolean;
}
