export type {
  HistoryCommand,
  HistoryCursor,
  HistoryEntry,
  HistoryStack,
  HistoryTimelinePatch,
  SheetHistoryButtonsProps,
  SheetHistoryStore,
} from './types';

/** 스택 판정만 public — stack 연산·apply는 model 내부 */
export { canRedo, canUndo } from './lib/edit-history';

export { useSheetHistoryStore } from './model/use-sheet-history-store';

export { SheetHistoryButtons } from './ui/sheet-history-buttons';
