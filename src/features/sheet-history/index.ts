export type {
  HistoryCommand,
  HistoryEntry,
  HistoryStack,
  HistoryTimelinePatch,
  SheetHistoryButtonsProps,
  SheetHistoryStore,
} from './types';

/** 스택 판정만 public — stack 연산·apply는 model 내부 */
export { canRedo, canUndo } from './lib/edit-history';

/** push 엔트리 빌드 헬퍼 — widget 훅이 소비 */
export { buildCurrents, buildMultiEntry, buildUpdateEntry } from './lib/push-entries';

export { useSheetHistoryStore } from './model/use-sheet-history-store';

export { SheetHistoryButtons } from './ui/sheet-history-buttons';
