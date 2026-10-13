import type { CSSProperties, UIEvent } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSheetStore, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import { SubtitleIoPanel } from '@/features/subtitle-io';
import { useSheetShortkey } from '@/features/shortkey';
import { cn } from '@/shared/lib/utils';
import { DEFAULT_ESTIMATE_ROW_HEIGHT } from '../lib/columns';
import { isMultipleActive } from '../lib/is-multiple-active';
import { useSheetClipActions } from '../lib/clip/use-sheet-clip-actions';
import { useSheetCellEdit } from '../lib/edit/use-sheet-cell-edit';
import { useSheetMove } from '../lib/move/use-sheet-move';
import { useSheetWindow } from '../lib/move/use-sheet-window';
import { useSheetSearchActions } from '../lib/search/use-sheet-search-actions';
import { useSheetSelectionActions } from '../lib/selection/use-sheet-selection-actions';
import { useSheetTimeActions } from '../lib/time/use-sheet-time-actions';
import { useSheetUndoActions } from '../lib/undo/use-sheet-undo-actions';
import { buildSheetShortkeyActions } from '../lib/shortkey/build-sheet-shortkey-actions';
import type { SheetBodyProps } from '../types';
import { SheetBodyToolbar } from './sheet-body-toolbar';
import { SheetCellEditor } from './sheet-cell-editor';
import { SheetRow } from './sheet-row';

const EMPTY_TIMELINES: readonly SheetTimelineItem[] = [];

/**
 * 시트 body 윈도 + 행 렌더.
 * - page(viewport×3) 스냅 · paddingTop 흐름 레이아웃
 * - 탭별 scrollTop 복원
 * - 셀 더블클릭/우클릭/문자 입력 편집 · blur 저장
 * - 전역 키는 shortkey (이동·에딧·선택·CRUD·undo/redo)
 */
const SheetBody = ({
  format,
  rows,
  estimateRowHeight,
  className,
  scrollTop = 0,
  scrollRestoreKey = 0,
  onScrollTopChange,
  onHorizontalScroll,
  onUpdateCell,
  chromePortalEl = null,
}: SheetBodyProps) => {
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const { scrollRef, sheetWindow, handleScroll, setScrollTop } = useSheetWindow({
    rows,
    restoreScrollTop: scrollTop,
    restoreKey: scrollRestoreKey,
    onScrollTopChange,
  });

  // 스토어 게이트 — stable wrapper (cell-edit·search-actions가 공유, 순환 배선 방지)
  const closeSearchPanel = useCallback(() => useSheetSearchStore.getState().closeSearchPanel(), []);
  const isSearchInputFocused = useCallback(
    () => useSheetSearchStore.getState().searchInputFocused,
    [],
  );

  const {
    mode,
    target,
    inputRef,
    wrapRef,
    currentRowIndex,
    currentColumn,
    isEditing,
    isTextTarget,
    isTimeTarget,
    hasFocus,
    endEdit,
    beginEdit,
    cancelEdit,
    beginEditFromTyping,
    insertEditorLineBreak,
    applyFocus,
    handleCellClick,
    handleCellDoubleClick,
    handleCellContextMenu,
    handleInputKeyDown,
    handleInputClick,
    handleEditorBlur,
  } = useSheetCellEdit({
    format,
    rows,
    scrollRef,
    scrollContentRef,
    setScrollTop,
    onCommitCell: (rowIndex, column, value) => onUpdateCell?.(rowIndex, column, value) ?? false,
    closeSearchPanel,
    isSearchInputFocused,
  });

  const { searchHitKeys, handleSearchJump, toggleSearch } = useSheetSearchActions({
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
    totalHeight: sheetWindow.totalHeight,
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
    onUpdateCell: (rowIndex, column, value) => onUpdateCell?.(rowIndex, column, value) ?? false,
    closeSearchPanel,
  });

  const time = useSheetTimeActions({
    format,
    currentRowIndex,
    currentColumn,
    isTimeTarget,
    closeSearchPanel,
  });

  const { canUndo, canRedo, handleUndo, handleRedo } = useSheetUndoActions({
    format,
    rows,
    totalHeight: sheetWindow.totalHeight,
    isEditing,
    applyFocus,
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

  const getShortkeyActions = () =>
    buildSheetShortkeyActions({
      move,
      isEditing,
      isTextTarget,
      hasFocus,
      isMultiple: isMultipleActive,
      beginEdit,
      cancelEdit,
      beginEditFromTyping,
      insertEditorLineBreak,
      toggleMultiple: handleToggleMultipleClick,
      toggleRowSelect: () => {
        if (currentRowIndex == null) return;
        handleSpaceToggle(currentRowIndex);
      },
      insertRow: handleInsertAtFocus,
      removeRow: handleRemoveAtFocus,
      applyTextFormat: clip.applyTextFormat,
      clearCell: clip.clearCell,
      clipCut: clip.clipCut,
      clipCopy: clip.clipCopy,
      clipPaste: clip.clipPaste,
      isTimeTarget,
      timePlus: time.timePlus,
      timeMinus: time.timeMinus,
      toggleSearch,
      undo: handleUndo,
      redo: handleRedo,
    });

  useSheetShortkey({ getActions: getShortkeyActions });

  const handleBodyScroll = (event: UIEvent<HTMLDivElement>) => {
    handleScroll();
    onHorizontalScroll?.(event.currentTarget.scrollLeft);
  };

  const timelines = useSheetStore(
    (state) => state.sheets[state.active]?.timelines ?? EMPTY_TIMELINES,
  );
  const storeSheets = useSheetStore((state) => state.sheets);
  const setActiveTimelinesAction = useSheetStore((state) => state.setActiveTimelines);

  const workbookTabs = useMemo(
    () => storeSheets.map((sheet) => ({ name: sheet.name, timelines: sheet.timelines })),
    [storeSheets],
  );

  /** import — 활성 탭 timelines 교체 + 활성 탭 history·search 초기화 + 포커스 row 0 */
  const handleSubtitleImported = (nextTimelines: SheetTimelineItem[]) => {
    endEdit(false);
    if (!setActiveTimelinesAction(nextTimelines)) return;
    useSheetHistoryStore.getState().resetActiveStack();
    useSheetSearchStore.getState().clearSearchHits();
    setScrollTop(0);
    applyFocus(0, 'text');
  };

  const chrome = (
    <>
      <SubtitleIoPanel
        sheetFormat={format}
        timelines={timelines}
        workbookTabs={workbookTabs}
        onImported={handleSubtitleImported}
      />
      <SheetBodyToolbar
        multipleActive={multipleActive}
        onToggleMultiple={handleToggleMultipleClick}
        onInsertRow={handleInsertAtFocus}
        onRemoveRow={handleRemoveAtFocus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        search={{
          format,
          timelines,
          rows,
          onJump: handleSearchJump,
        }}
      />
    </>
  );

  return (
    <>
      {chromePortalEl ? createPortal(chrome, chromePortalEl) : null}
      <div
        ref={scrollRef}
        data-slot="sheet-body"
        role="presentation"
        className={cn('relative h-full min-h-0 flex-1 overflow-auto', className)}
        onScroll={handleBodyScroll}
      >
        <div
          ref={scrollContentRef}
          data-slot="sheet-body-scroll"
          className="relative w-full min-w-[var(--sheet-contain-min)]"
        >
          <SheetCellEditor
            key={
              target != null ? `${target.rowIndex}:${target.column}` : 'sheet-cell-editor-hidden'
            }
            mode={mode}
            left={target?.left}
            top={target?.top}
            minWidth={target?.minWidth}
            minHeight={target?.minHeight}
            wrapRef={wrapRef}
            inputRef={inputRef}
            onInputKeyDown={handleInputKeyDown}
            onInputClick={handleInputClick}
            onInputBlur={handleEditorBlur}
          />
          <div
            data-slot="sheet-panel-body"
            className="relative box-border w-full min-w-full"
            style={
              {
                '--sheet-panel-height': `${sheetWindow.totalHeight}px`,
                '--sheet-window-padding-top': `${sheetWindow.paddingTop}px`,
                height: 'var(--sheet-panel-height)',
                paddingTop: 'var(--sheet-window-padding-top)',
              } as CSSProperties
            }
          >
            {sheetWindow.indices.map((rowIndex) => {
              const row = rows[rowIndex];
              if (!row) return null;

              const rowHeight = row.height ?? estimateRowHeight ?? DEFAULT_ESTIMATE_ROW_HEIGHT;

              return (
                <SheetRow
                  key={row.index}
                  format={format}
                  row={row}
                  data-index={rowIndex}
                  currentColumn={currentRowIndex === row.index ? currentColumn : null}
                  searchHitKeys={searchHitKeys}
                  onCellClick={handleCellClick}
                  onCellDoubleClick={handleCellDoubleClick}
                  onCellContextMenu={handleCellContextMenu}
                  style={
                    {
                      '--sheet-row-size': `${rowHeight}px`,
                      height: 'var(--sheet-row-size)',
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export { SheetBody };
