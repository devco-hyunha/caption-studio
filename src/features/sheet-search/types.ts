import type { SheetTimelineItem, SheetTimelineFormat } from '@/entities/subtitle-sheet';

/** 검색 히트 — editable 열 인덱스 (`EDITABLE_COLUMNS[format]`) */
export interface SearchHit {
	row: number;
	col: number;
}

/** 검색이 쓰는 시트 포맷 — entities 타입 재사용 */
export type SheetSearchFormat = SheetTimelineFormat;

/**
 * error-search가 필요로 하는 최소 행 구조.
 * widgets의 SheetRowView를 상향 import하지 않기 위한 구조적 최소 계약 (FSD 단방향).
 */
export interface ErrorRowLike {
	index: number;
	isError?: boolean;
}

/** 시트 검색 패널 props — format·timelines·rows·점프 콜백 */
export interface SheetSearchPanelProps {
	format: SheetSearchFormat;
	timelines: readonly SheetTimelineItem[];
	rows: readonly ErrorRowLike[];
	onJump: (hit: SearchHit) => void;
}

/** 시트 검색 스토어 — 패널·쿼리·hits·error-search 상태와 동작 */
export interface SheetSearchStore {
	searchPanelOpen: boolean;
	searchHits: SearchHit[];
	searchCurrent: number;
	/** 검색 input 포커스 중 에딧 차단 */
	searchInputFocused: boolean;
	/** error-search 체크박스 — 체크 시 검색 input 비우기·hits를 errorRows로 대체 */
	errorSearchActive: boolean;

	toggleSearchPanel: () => void;
	/** 열려 있을 때만 닫고 hits/query 초기화 */
	closeSearchPanel: () => void;
	/** 탭 전환 시 hits만 비움 */
	clearSearchHits: () => void;
	setSearchInputFocused: (focused: boolean) => void;
	/** 소문자 normalized 후 매치. 첫 hit 반환(없으면 null) */
	runSearch: (
		query: string,
		timelines: readonly SheetTimelineItem[],
		format: SheetSearchFormat,
	) => SearchHit | null;
	/** error-search — 체크 시 errorRows hits, 해제 시 빈 hits */
	toggleErrorSearch: (rows: readonly ErrorRowLike[]) => SearchHit | null;
	/** prev/next 이동 후 점프할 hit (경계·hits 없으면 null) */
	searchStep: (direction: 'next' | 'prev') => SearchHit | null;
	canSearchPrev: () => boolean;
	canSearchNext: () => boolean;
}
