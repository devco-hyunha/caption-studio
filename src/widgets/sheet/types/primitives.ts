import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SheetColumnId } from '@/shared/types/sheet-column';

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
  /** 재생 시각에 활성인 행 (video-sync activeIndices) */
  isPlaybackActive?: boolean;
}

export interface SheetColumnDef {
  id: SheetColumnId;
  label: string;
  editable: boolean;
}

/** 행 높이 — `SheetRowView.height`만 소비하는 렌더 윈도 입력 */
export type RowHeightInfo = Pick<SheetRowView, 'height'>;

/** 셀 위치·min 크기 — 에디터 오버레이 좌표 */
export interface SheetCellRect {
  left: number;
  top: number;
  minWidth: number;
  minHeight: number;
}

export interface SheetStartRow {
  /** 행 시작 Y (해당 행 높이 누적 전) */
  offset: number;
  height: number;
  index: number;
}

export interface SheetPageViewBox {
  viewTop: number;
  viewHeight: number;
}

export interface SheetPageMoveResult {
  row: number;
  scrollTop: number | null;
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

export interface SheetTabView {
  name: string;
}

/** 셀 에디터 — 비활성 / 포커스(선택) / 편집 */
export type SheetCellEditorMode = 'hidden' | 'focus' | 'edit';

/** applyFocus 옵션 — 스크롤 위치 지정 */
export interface ApplyFocusOptions {
  scrollTop?: number | null;
}

export interface SheetCellEditTarget extends SheetCellRect {
  rowIndex: number;
  column: SheetColumnId;
  value: string;
}

/** applyFocus 스크롤 계산 입력 — body 실측값 */
export interface FocusBodyMetrics {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
}

/** applyFocus 스크롤 계산 결과 */
export interface FocusScrollResult {
  target: SheetCellEditTarget;
  rowScroll: number | null;
  scrollLeft: number | null;
}

/**
 * 편집 진입 probe — React KeyboardEvent와 window KeyboardEvent의 공통 부분집합.
 * 두 이벤트 타입을 한 함수로 처리하기 위한 최소 계약.
 */
export interface SheetEditKeyProbe {
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  key: string;
  code: string;
  preventDefault?: Fn<void>;
  isComposing?: boolean;
  nativeEvent?: { isComposing?: boolean; keyCode?: number };
  keyCode?: number;
}

/** 편집 모드 ref 쌍 — 순수 판별(edit-mode) 입력 */
export interface EditModeDeps {
  modeRef: RefObject<SheetCellEditorMode>;
  targetRef: RefObject<SheetCellEditTarget | null>;
}
