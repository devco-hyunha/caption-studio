export type SheetFormat = 'smi' | 'srt';

export type SheetColumnId = 'index' | 'starttime' | 'endtime' | 'dur' | 'text' | 'memo';

export interface SheetRowView {
	index: number;
	starttime: string;
	endtime: string;
	dur: string;
	text: string;
	memo: string;
	/** convert.js rowInfo.height와 동일 기준(사전 계산) */
	height: number;
	isError?: boolean;
	isSelected?: boolean;
}

export interface SheetColumnDef {
	id: SheetColumnId;
	label: string;
	editable: boolean;
}

export interface RowHeightInfo {
	height: number;
}

export interface SheetStartRow {
	/** 행 시작 Y (해당 행 높이 누적 전) */
	offset: number;
	height: number;
	index: number;
}

export interface SheetMoveCursor {
	row: number;
	/** editable 열 인덱스 (`EDITABLE_COLUMNS[format]`) */
	col: number;
}

export interface SheetPageViewBox {
	viewTop: number;
	viewHeight: number;
}

export interface SheetPageMoveResult {
	row: number;
	scrollTop: number | null;
}

export interface SheetScrollIntoViewResult {
	scrollTop: number | null;
}

export interface SheetColScrollIntoViewResult {
	scrollLeft: number | null;
}

export interface SheetWindowResult {
	/** viewport 높이 기준 page (floor(scrollTop / viewportHeight)) */
	pageIndex: number;
	startIndex: number;
	endIndex: number;
	paddingTop: number;
	totalHeight: number;
	/** 윈도에 포함할 행 index (inclusive start ~ exclusive end) */
	indices: number[];
}
