import type { Fn } from '@/shared/types/fn';
import type {
  SheetShortkeyActions,
  SheetShortkeyMoveActions,
  SheetTextFormatCommand,
} from '@/features/shortkey';
import type { UseSheetClipActionsResult } from './clip';
import type { UseSheetTimeActionsResult } from './time';
import type { UseSheetVideoActionsResult } from './video';

/** sheet-body shortkey actions 조립 params — 훅 결과 + 포커스·선택 콜백 */
export interface UseSheetBodyShortkeyActionsParams {
  move: SheetShortkeyMoveActions;
  clip: UseSheetClipActionsResult;
  time: UseSheetTimeActionsResult;
  video: UseSheetVideoActionsResult;
  isEditing: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  isTimeTarget: Fn<boolean>;
  hasFocus: Fn<boolean>;
  beginEdit: Fn<void>;
  cancelEdit: Fn<void>;
  beginEditFromTyping: SheetShortkeyActions['beginEditFromTyping'];
  insertEditorLineBreak: Fn<void>;
  toggleMultiple: Fn<void>;
  currentRowIndex: number | null;
  handleSpaceToggle: (row: number) => void;
  insertRow: Fn<void>;
  removeRow: Fn<void>;
  focusSearch: Fn<void>;
  closeSearchPanel: Fn<void>;
  isSearchPanelOpen: Fn<boolean>;
  undo: Fn<void>;
  redo: Fn<void>;
}

/** shortkey에 주입할 actions 팩토리 — 시트 동작 API */
export type UseSheetBodyShortkeyActionsResult = () => SheetShortkeyActions;

/** shortkey에 주입할 시트 동작 API 조립 params */
export interface BuildSheetShortkeyActionsParams {
  move: SheetShortkeyMoveActions;
  isEditing: Fn<boolean>;
  isTextTarget: Fn<boolean>;
  hasFocus: Fn<boolean>;
  isMultiple: Fn<boolean>;
  beginEdit: Fn<void>;
  cancelEdit: Fn<void>;
  beginEditFromTyping: SheetShortkeyActions['beginEditFromTyping'];
  insertEditorLineBreak: Fn<void>;
  toggleMultiple: Fn<void>;
  toggleRowSelect: Fn<void>;
  insertRow: Fn<void>;
  removeRow: Fn<void>;
  applyTextFormat: (command: SheetTextFormatCommand) => void;
  clearCell: Fn<void>;
  clipCut: Fn<void>;
  clipCopy: Fn<void>;
  clipPaste: Fn<void>;
  isTimeTarget: Fn<boolean>;
  timePlus: Fn<void>;
  timeMinus: Fn<void>;
  timeCarve: Fn<void>;
  videoJump: Fn<void>;
  sheetJump: Fn<void>;
  videoPlayToggle: Fn<void>;
  videoSeekPrev: Fn<void>;
  videoSeekNext: Fn<void>;
  volumeUp: Fn<void>;
  volumeDown: Fn<void>;
  cuePrev: Fn<void>;
  cueNext: Fn<void>;
  focusSearch: Fn<void>;
  closeSearchPanel: Fn<void>;
  isSearchPanelOpen: Fn<boolean>;
  undo: Fn<void>;
  redo: Fn<void>;
}
