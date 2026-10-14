import type { Fn } from '@/shared/types/fn';
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react';
import type { SheetColumnId, SheetRowView, SheetTabView } from '../primitives';

export interface UseSheetsResult {
  tabs: SheetTabView[];
  activeTabIndex: number;
  rows: SheetRowView[];
  activeScrollTop: number;
  handleScrollTopChange: (scrollTop: number) => void;
  handleSelectTab: (index: number) => void;
  handleAddTab: Fn<void>;
  handleDeleteTab: (index: number) => void;
  handleRenameTab: (index: number, name: string) => boolean;
  handleCopyTab: (index: number) => void;
  handleUpdateCell: (rowIndex: number, column: SheetColumnId, value: string) => boolean;
}

export interface UseSheetTabRenameParams {
  tabs: SheetTabView[];
  onRenameTab?: (index: number, name: string) => boolean;
}

export interface UseSheetTabRenameResult {
  renamingIndex: number | null;
  draftName: string;
  isDraftInvalid: boolean;
  renameInputRef: RefObject<HTMLInputElement | null>;
  renameInputSize: number;
  handleBeginRename: (index: number) => void;
  handleDraftChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
  handleDraftKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>, index: number) => void;
  handleDraftBlur: (event: FocusEvent<HTMLInputElement>, index: number) => void;
  isRenaming: boolean;
}
