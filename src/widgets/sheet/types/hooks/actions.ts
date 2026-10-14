import type { RefObject } from 'react';
import type { Fn } from '@/shared/types/fn';
import type { SearchHit } from '@/features/sheet-search';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { SheetColumnId, SheetFormat, SheetMoveCursor, SheetRowView } from '../primitives';
import type { SheetBodyToolbarActions } from '../props';
import type { UseSheetCellEditResult } from './edit';
import type { UseSheetClipActionsResult } from './clip';
import type { UseSheetMoveResult } from './move';
import type { UseSheetTimeActionsResult } from './time';
import type { UseSheetVideoActionsResult } from './video';
import type { UseSheetBodyShortkeyActionsResult } from './shortkey';

/** sheet-body action composite params — cell-edit 결과 + window 값 + 커밋·검색 게이트 */
export interface UseSheetBodyActionsParams {
  format: SheetFormat;
  rows: SheetRowView[];
  /** useSheetCellEdit 결과 — focus·edit 상태 번들 */
  cellEdit: UseSheetCellEditResult;
  /** useSheetWindow scrollRef — move 스크롤 계산 */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** 시트 총 높이 — selection·undo pending focus */
  totalHeight: number;
  /** useSheetWindow setScrollTop — import 후 스크롤 0 */
  setScrollTop: (scrollTop: number) => void;
  onUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
  /** 서식·클립·선택 직전 검색 패널 닫기 */
  closeSearchPanel: Fn<void>;
}

/** sheet-body action composite 결과 — search·selection·clip·time·video·undo·move + shortkey 팩토리 */
export interface UseSheetBodyActionsResult {
  searchHitKeys: ReadonlySet<string>;
  handleSearchJump: (hit: SearchHit) => void;
  toggleSearch: Fn<void>;
  multipleActive: boolean;
  handleAppendRow: (cursor: SheetMoveCursor) => void;
  handleRowMoved: (row: number, withShift: boolean) => void;
  handleSpaceToggle: (row: number) => void;
  handleInsertAtFocus: Fn<void>;
  handleRemoveAtFocus: Fn<void>;
  handleToggleMultipleClick: Fn<void>;
  clip: UseSheetClipActionsResult;
  time: UseSheetTimeActionsResult;
  video: UseSheetVideoActionsResult;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: Fn<void>;
  handleRedo: Fn<void>;
  move: UseSheetMoveResult;
  getShortkeyActions: UseSheetBodyShortkeyActionsResult;
  /** import — 활성 탭 timelines 교체 + 슬롯 rebuild + history·search 초기화 + 포커스 row 0 */
  handleImported: (nextTimelines: SheetTimelineItem[]) => void;
  /** toolbar가 소비하는 필드 번들 — sheet-body destructuring 최소화 */
  toolbarActions: SheetBodyToolbarActions;
}
