import type { Fn } from '@/shared/types/fn';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

/** 히스토리 포커스 좌표 — editable col index */
export interface HistoryCursor {
  row: number;
  col: number;
}

export interface HistoryTimelinePatch {
  index: number;
  data: SheetTimelineItem;
}

export type HistoryCommand = 'insert' | 'remove' | 'update' | `multi.${string}`;

/** editHistory 엔트리 */
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

/** 비영속 히스토리 스토어 — 탭별 스택 */
export interface SheetHistoryStore {
  stacks: HistoryStack[];
  activeSheetIndex: number;

  resetForSheets: (sheetCount: number, activeIndex?: number) => void;
  /** import — 활성 탭 스택만 초기화 */
  resetActiveStack: Fn<void>;
  setActiveSheetIndex: (index: number) => void;
  addHistoryStack: Fn<void>;
  insertHistoryStackAt: (index: number) => void;
  removeHistoryStackAt: (index: number) => void;

  pushHistory: (entry: HistoryEntry) => void;
  /** 성공 시 포커스할 cursor */
  undo: Fn<HistoryCursor | null>;
  redo: Fn<HistoryCursor | null>;
  canUndo: Fn<boolean>;
  canRedo: Fn<boolean>;
}

export interface SheetHistoryButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: Fn<void>;
  onRedo: Fn<void>;
  className?: string;
}
