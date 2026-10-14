import type { Fn } from '@/shared/types/fn';

/** `subtitleSheets` 타임라인 행 */
export interface SheetTimelineItem {
  start?: number;
  end?: number;
  sync?: number;
  text?: string;
  memo?: string;
}

/** `timeSearch` 결과 — 재생 ms → 행 매핑 (`/` sheet.seek.timeSearch parity) */
export interface TimeSearchHit {
  index: number;
  /** 구간 안이면 true, start 이전 갭이면 false */
  visible: boolean;
  /** 매칭 행 스냅샷. 없으면 null */
  timeline: SheetTimelineItem | null;
}

/** 분(minute) 버킷 → 행 index 목록. 세션용 · 비영속 */
export type TimeSlotIndex = Map<number, number[]>;

/** 겹침 포함 활성 행들 (개선: 다중 라인) */
export interface TimeSearchAllHit {
  /** `start <= ms < end` 인 행 index (오름차순) */
  indices: number[];
}

/** `subtitleSheets.sheets[]` 항목 (런타임) */
export interface Sheet {
  name: string;
  timelines: SheetTimelineItem[];
  smiName: string;
  smiLang: string;
  /** 영속 제외 — 탭별 scrollTop */
  scroll: number;
  /** 영속 제외 — 포커스 등 뷰 상태 */
  current: Record<string, unknown>;
  /** 영속 제외 — multiple 선택 행 */
  selectedRows: number[];
  /** 영속 제외 — 다중 선택 모드 진입 여부 */
  multipleActive: boolean;
  /** 영속 제외 — 다중 선택 시작 행 (Shift 확장 앵커) */
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

/** 행 CRUD에 사용할 시트 포맷 (기본값: smi) */
export type SheetTimelineFormat = 'smi' | 'srt';

/** 다중 선택 런타임 상태 */
export interface SheetSelectionState {
  /** 선택된 행 인덱스 */
  selectedRows: number[];
  /** Shift 확장 앵커 */
  multipleStart: number | null;
}

/** Zustand 스토어 — 상태 + 액션 */
export interface SheetStore extends SheetsState {
  selectSheet: (index: number) => void;
  addSheet: Fn<void>;
  deleteSheet: (index: number) => void;
  renameSheet: (index: number, name: string) => boolean;
  copySheet: (index: number) => void;
  updateActiveCell: (rowIndex: number, column: EditableColumn, value: string) => boolean;
  updateSheetScroll: (index: number, scrollTop: number) => void;
  /** 다중 선택 모드 토글 (현재 행 선택 포함) */
  toggleMultiple: (currentRow: number) => void;
  /** 다중 선택 모드에서 행 선택 토글 (Shift: 앵커~행 범위 합집합) */
  toggleSelectedRow: (row: number, withShift: boolean) => void;
  /** 다중 선택 모드에서 앵커 이동 */
  setMultipleStart: (row: number) => void;
  /** 행 추가 — 추가된 행 인덱스 (다중 선택 모드에서는 null) */
  insertTimelineAfter: (row: number, format: SheetTimelineFormat) => number | null;
  /** 행 삭제 — 이동할 포커스 행 인덱스 (다중 선택 모드에서는 null) */
  removeTimelineAt: (row: number) => number | null;
  /** undo/redo 전용 행 삭제 — 다중 선택 모드에서도 동작. 이동할 포커스 행 인덱스 */
  removeTimelineAtForHistory: (row: number) => number | null;
  /** 다중 선택 중 선택 행 text에 transform 적용. 반영 없으면 false */
  updateSelectedTexts: (transform: (text: string, rowIndex: number) => string) => boolean;
  /** 활성 시트 `row` 타임라인 ms patch. 행 없으면 false */
  patchActiveTimeline: (row: number, timeline: SheetTimelineItem) => boolean;
  /** 다중 선택 중 선택 행 타임라인 ms 일괄 patch. 반영 없으면 false */
  patchSelectedTimelines: (patches: Map<number, SheetTimelineItem>) => boolean;
  /** undo/redo — 인덱스 삽입(자동 시각 채움 없음) */
  spliceTimelineAt: (index: number, data: SheetTimelineItem) => boolean;
  /** undo/redo — multi 패치 (`{ index, data }[]`, multiple 무관) */
  replaceTimelinePatches: (
    patches: readonly { index: number; data: SheetTimelineItem }[],
  ) => boolean;
  /** import — 활성 탭 timelines 통째 교체 (multiple·스크롤·포커스 초기화) */
  setActiveTimelines: (timelines: readonly SheetTimelineItem[]) => boolean;
}
