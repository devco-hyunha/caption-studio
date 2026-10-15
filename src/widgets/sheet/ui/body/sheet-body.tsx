import type { UIEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSheetSearchStore } from '@/features/sheet-search';
import { useSheetShortkey } from '@/features/shortkey';
import { registerSheetTimeCarveHandler, usePlaybackSet } from '@/features/video-sync';
import { useSheetBodyActions } from '../../lib/actions/use-sheet-body-actions';
import { useSheetCellEdit } from '../../lib/edit/use-sheet-cell-edit';
import { useSheetWindow } from '../../lib/move/use-sheet-window';
import type { SheetBodyProps } from '../../types';
import { SheetBodyToolbar } from './toolbar';
import { SheetBodyRows } from './sheet-body-rows';
import { SheetScrollContainer } from './scroll-container';
import { SheetCellEditor } from '../sheet-cell-editor';

/**
 * 시트 body 윈도 + 행 렌더.
 * - page(viewport×3) 스냅 · paddingTop 흐름 레이아웃
 * - 탭별 scrollTop 복원
 * - 셀 더블클릭/우클릭/문자 입력 편집 · blur 저장
 * - 전역 키는 shortkey (이동·에딧·선택·CRUD·undo/redo)
 * - 행 렌더는 SheetBodyRows · action wiring·import는 useSheetBodyActions composite
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
  const isSearchPanelOpen = useCallback(() => useSheetSearchStore.getState().searchPanelOpen, []);

  const cellEdit = useSheetCellEdit({
    format,
    rows,
    scrollRef,
    scrollContentRef,
    setScrollTop,
    onCommitCell: (rowIndex, column, value) => onUpdateCell?.(rowIndex, column, value) ?? false,
    closeSearchPanel,
    isSearchInputFocused,
  });
  const {
    mode,
    target,
    inputRef,
    wrapRef,
    currentRowIndex,
    currentColumn,
    cellEvents,
    inputEvents,
  } = cellEdit;

  const { searchHitKeys, time, getShortkeyActions, handleImported, toolbarActions } =
    useSheetBodyActions({
      format,
      rows,
      cellEdit,
      scrollRef,
      totalHeight: sheetWindow.totalHeight,
      setScrollTop,
      onUpdateCell: (rowIndex, column, value) => onUpdateCell?.(rowIndex, column, value) ?? false,
      closeSearchPanel,
      isSearchPanelOpen,
    });

  /** 「시간 입력」 버튼 · Ctrl+` 공용 — 시트 핸들러 등록 */
  useEffect(() => {
    registerSheetTimeCarveHandler(time.timeCarve);
    return () => {
      registerSheetTimeCarveHandler(null);
    };
  }, [time.timeCarve]);

  useSheetShortkey({ getActions: getShortkeyActions });

  const playbackSet = usePlaybackSet();

  const handleBodyScroll = (event: UIEvent<HTMLDivElement>) => {
    handleScroll();
    onHorizontalScroll?.(event.currentTarget.scrollLeft);
  };

  const chrome = (
    <SheetBodyToolbar
      format={format}
      rows={rows}
      actions={toolbarActions}
      onImported={handleImported}
    />
  );

  return (
    <>
      {chromePortalEl ? createPortal(chrome, chromePortalEl) : null}
      <SheetScrollContainer
        scrollRef={scrollRef}
        contentRef={scrollContentRef}
        onScroll={handleBodyScroll}
        className={className}
      >
        <SheetCellEditor
          key={target != null ? `${target.rowIndex}:${target.column}` : 'sheet-cell-editor-hidden'}
          mode={mode}
          rect={target}
          wrapRef={wrapRef}
          inputRef={inputRef}
          inputEvents={inputEvents}
        />
        <SheetBodyRows
          format={format}
          rows={rows}
          indices={sheetWindow.indices}
          totalHeight={sheetWindow.totalHeight}
          paddingTop={sheetWindow.paddingTop}
          estimateRowHeight={estimateRowHeight}
          currentRowIndex={currentRowIndex}
          currentColumn={currentColumn}
          searchHitKeys={searchHitKeys}
          cellEvents={cellEvents}
          playbackSet={playbackSet}
        />
      </SheetScrollContainer>
    </>
  );
};

export { SheetBody };
