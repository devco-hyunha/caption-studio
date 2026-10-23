import type { UseSheetBodyActionsParams, UseSheetBodyActionsResult } from '../../types';
import type { SheetColorCommand } from '@/shared/types/color-command';
import type { SheetTextFormatCommand } from '@/features/shortkey';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import { rebuildVideoTimeSlotsFromActiveSheet } from '@/features/video-sync';
import { useSheetSearchActions } from '../search/use-sheet-search-actions';
import { useSheetSelectionActions } from '../selection/use-sheet-selection-actions';
import { useSheetClipActions } from '../clip/use-sheet-clip-actions';
import { useSheetColorWiring } from '../color/use-sheet-color-wiring';
import { useSheetTimeActions } from '../time/use-sheet-time-actions';
import { useSheetVideoActions } from '../video/use-sheet-video-actions';
import { useSheetUndoActions } from '../undo/use-sheet-undo-actions';
import { useSheetMove } from '../move/use-sheet-move';
import { useSheetBodyShortkeyActions } from '../shortkey/use-sheet-body-shortkey-actions';

/**
 * sheet-body action composite — search·selection·clip·time·video·undo·move wiring 순서를 캡슐화.
 * cell-edit 결과·window 값·커밋·검색 게이트만 입력받는다.
 * wiring 순서: selection → move(selection 핸들러 소비) → shortkey(clip·time·video·undo·move 소비).
 */
const useSheetBodyActions = ({
  format,
  rows,
  cellEdit,
  scrollRef,
  totalHeight,
  setScrollTop,
  onUpdateCell,
  closeSearchPanel,
  isSearchPanelOpen,
}: UseSheetBodyActionsParams): UseSheetBodyActionsResult => {
  const {
    isEditSurface,
    isEditing,
    isTextTarget,
    isTimeTarget,
    hasFocus,
    beginEdit,
    cancelEdit,
    beginEditFromTyping,
    insertEditorLineBreak,
    endEdit,
    applyFocus,
    currentRowIndex,
    currentColumn,
    inputRef,
  } = cellEdit;

  const setActiveTimelines = useSheetStore((state) => state.setActiveTimelines);

  /** import — 활성 탭 timelines 교체 + 슬롯 rebuild + 활성 탭 history·search 초기화 + 포커스 row 0 */
  const handleImported = (nextTimelines: SheetTimelineItem[]) => {
    endEdit(false);
    if (!setActiveTimelines(nextTimelines)) return;
    rebuildVideoTimeSlotsFromActiveSheet();
    useSheetHistoryStore.getState().resetActiveStack();
    useSheetSearchStore.getState().clearSearchHits();
    setScrollTop(0);
    applyFocus(0, 'text');
  };

  const { searchHitKeys, handleSearchJump, focusSearch } = useSheetSearchActions({
    format,
    rows,
    isEditing,
    endEdit,
    applyFocus,
  });

  const {
    multipleActive,
    handleAppendRow,
    handleRowMoved,
    handleSpaceToggle,
    handleInsertAtFocus,
    handleRemoveAtFocus,
    handleToggleMultipleClick,
  } = useSheetSelectionActions({
    format,
    rows,
    totalHeight,
    isEditing,
    currentRowIndex,
    currentColumn,
    endEdit,
    applyFocus,
    closeSearchPanel,
  });

  const clip = useSheetClipActions({
    format,
    currentRowIndex,
    currentColumn,
    isEditing,
    isTextTarget,
    inputRef,
    onUpdateCell,
    closeSearchPanel,
  });

  const color = useSheetColorWiring({
    format,
    currentRowIndex,
    currentColumn,
    isEditing,
    isTextTarget,
    inputRef,
    onUpdateCell,
    closeSearchPanel,
  });

  const time = useSheetTimeActions({
    format,
    currentRowIndex,
    currentColumn,
    isTimeTarget,
    isEditing,
    closeSearchPanel,
    onUpdateCell,
  });

  const video = useSheetVideoActions({
    isEditing,
    currentRowIndex,
    currentColumn,
    endEdit,
    applyFocus,
  });

  const { canUndo, canRedo, handleUndo, handleRedo } = useSheetUndoActions({
    format,
    rows,
    totalHeight,
    isEditing,
    applyFocus,
    closeSearchPanel,
  });

  const move = useSheetMove({
    format,
    rows,
    isEditing,
    currentRowIndex,
    currentColumn,
    scrollRef,
    endEdit,
    applyFocus,
    onAppendRow: handleAppendRow,
    onRowMoved: handleRowMoved,
  });

  const getShortkeyActions = useSheetBodyShortkeyActions({
    move,
    clip,
    color,
    time,
    video,
    isEditing,
    isTextTarget,
    isTimeTarget,
    hasFocus,
    beginEdit,
    cancelEdit,
    beginEditFromTyping,
    insertEditorLineBreak,
    toggleMultiple: handleToggleMultipleClick,
    currentRowIndex,
    handleSpaceToggle,
    insertRow: handleInsertAtFocus,
    removeRow: handleRemoveAtFocus,
    focusSearch,
    closeSearchPanel,
    isSearchPanelOpen,
    undo: handleUndo,
    redo: handleRedo,
  });

  /** `sheet-edit` 버튼 토글 — 비에딧 beginEdit(F2와 동일), 에딧 중 cancelEdit(Esc와 동일) */
  const handleEditToggleClick = () => {
    if (isEditing()) {
      cancelEdit();
      return;
    }
    beginEdit();
  };

  /** B/I/U 버튼 — clip 훅 소비 (에딧 execCommand·다중 일괄·단건 분기 내장) */
  const handleFormatClick = (command: SheetTextFormatCommand) => {
    clip.applyTextFormat(command);
  };

  /** color-reset 버튼 — color wiring applyColor('color_clear'), execCommand 매핑은 color 훅 정본 */
  const handleColorReset = () => {
    color.applyColor('color_clear');
  };

  /** 팔레트 스와치 버튼 — color0..7, color wiring applyColor (에딧·다중·단건 분기 내장) */
  const handleColorClick = (command: SheetColorCommand) => {
    color.applyColor(command);
  };

  const toolbarActions = {
    isEditing: isEditSurface,
    handleEditToggleClick,
    handleFormatClick,
    handleColorReset,
    handleColorClick,
    multipleActive,
    handleToggleMultipleClick,
    handleInsertAtFocus,
    handleRemoveAtFocus,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleSearchJump,
  };

  return {
    searchHitKeys,
    handleSearchJump,
    focusSearch,
    multipleActive,
    handleAppendRow,
    handleRowMoved,
    handleSpaceToggle,
    handleInsertAtFocus,
    handleRemoveAtFocus,
    handleToggleMultipleClick,
    clip,
    time,
    video,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    move,
    getShortkeyActions,
    handleImported,
    toolbarActions,
  };
};

export { useSheetBodyActions };
