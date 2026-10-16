import { useLayoutEffect, useRef } from 'react';
import { getActiveScroll, isEditableColumn, useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore, buildUpdateEntry } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import {
  rebuildVideoTimeSlotsFromActiveSheet,
  syncVideoTimeSlotsAfterRowTimeEdit,
} from '@/features/video-sync';
import { useLocaleStore } from '@/shared/lib/i18n';
import type { Fn } from '@/shared/types/fn';
import type { ConfirmOptions } from '@/shared/types/confirm';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import type { UseSheetsResult } from '../../types';
import { getEditableColIndex } from '../move/sheet-move';
import { getActiveSheetRows, toSheetTabs } from './subtitle-sheets';

/**
 * 탭 전환·CRUD 직전에 현재 body scrollTop을 활성 시트에 기록.
 * 셀 커밋 시 history push · 탭 CRUD 시 history 스택 동기화.
 * @param format 시트 포맷 — SMI dur는 다음 행 start 기준
 * @param closeSearchPanel 검색 패널 닫기 래퍼 (canonical prop)
 * @param confirm confirm 셸 진입점 — 삭제는 confirm 게이트 후 mutate (`/` tabs.js removeAt parity)
 */
const useSheets = (
  format: SubtitleFormat,
  closeSearchPanel: Fn<void>,
  confirm: (options: ConfirmOptions) => void,
): UseSheetsResult => {
  const active = useSheetStore((state) => state.active);
  const sheets = useSheetStore((state) => state.sheets);
  const selectSheetAction = useSheetStore((state) => state.selectSheet);
  const addSheetAction = useSheetStore((state) => state.addSheet);
  const deleteSheetAction = useSheetStore((state) => state.deleteSheet);
  const renameSheetAction = useSheetStore((state) => state.renameSheet);
  const copySheetAction = useSheetStore((state) => state.copySheet);
  const updateActiveCellAction = useSheetStore((state) => state.updateActiveCell);
  const updateSheetScrollAction = useSheetStore((state) => state.updateSheetScroll);

  const state = { active, sheets };
  const bodyScrollTopRef = useRef(getActiveScroll(state));

  useLayoutEffect(() => {
    useSheetHistoryStore.getState().resetForSheets(sheets.length, active);
    rebuildVideoTimeSlotsFromActiveSheet();
    // 최초 마운트만 — 탭 CRUD는 핸들러에서 스택 동기화
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount sync only
  }, []);

  const persistActiveScroll = () => {
    updateSheetScrollAction(active, bodyScrollTopRef.current);
  };

  /** 탭 전환·CRUD 후 searchHits 초기화 */
  const clearSearchHits = () => {
    useSheetSearchStore.getState().clearSearchHits();
  };

  const handleScrollTopChange = (scrollTop: number) => {
    bodyScrollTopRef.current = Math.max(0, scrollTop);
  };

  /** 탭 선택 — 현재 scrollTop을 시트에 기록하고 전환 후 대상 시트 스크롤 복원 */
  const handleSelectTab = (index: number) => {
    if (index === active) return;

    persistActiveScroll();
    selectSheetAction(index);
    useSheetHistoryStore.getState().setActiveSheetIndex(index);
    clearSearchHits();
    rebuildVideoTimeSlotsFromActiveSheet();
    bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
  };

  /** 시트 추가 — 새 시트는 스크롤 0 */
  const handleAddTab = () => {
    persistActiveScroll();
    addSheetAction();
    useSheetHistoryStore.getState().addHistoryStack();
    const nextActive = useSheetStore.getState().active;
    useSheetHistoryStore.getState().setActiveSheetIndex(nextActive);
    clearSearchHits();
    rebuildVideoTimeSlotsFromActiveSheet();
    bodyScrollTopRef.current = 0;
  };

  /** 마지막 탭 삭제 — 활성 시트 초기화 (`/` tabs.js `clearActive` parity) */
  const clearActiveSheet = () => {
    useSheetStore.getState().setActiveTimelines([]);
    useSheetHistoryStore.getState().resetActiveStack();
    clearSearchHits();
    rebuildVideoTimeSlotsFromActiveSheet();
    bodyScrollTopRef.current = 0;
  };

  /** 탭 삭제 — confirm 게이트 후 mutate. 마지막 탭이면 초기화 확인 (`/` tabs.js removeAt parity) */
  const handleDeleteTab = (index: number) => {
    const t = (key: string) => useLocaleStore.getState().t(key);

    if (useSheetStore.getState().sheets.length <= 1) {
      confirm({
        title: t('shell.confirm.lastTitle'),
        content: t('shell.confirm.lastContent'),
        bgDismiss: true,
        success: clearActiveSheet,
      });
      return;
    }

    confirm({
      title: t('shell.confirm.deleteTitle'),
      content: t('shell.confirm.deleteContent'),
      bgDismiss: true,
      success: () => {
        persistActiveScroll();
        deleteSheetAction(index);
        useSheetHistoryStore.getState().removeHistoryStackAt(index);
        clearSearchHits();
        rebuildVideoTimeSlotsFromActiveSheet();
        bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
      },
    });
  };

  const handleRenameTab = (index: number, name: string) => renameSheetAction(index, name);

  const handleCopyTab = (index: number) => {
    persistActiveScroll();
    copySheetAction(index);
    useSheetHistoryStore.getState().insertHistoryStackAt(index + 1);
    const nextActive = useSheetStore.getState().active;
    useSheetHistoryStore.getState().setActiveSheetIndex(nextActive);
    clearSearchHits();
    rebuildVideoTimeSlotsFromActiveSheet();
    bodyScrollTopRef.current = getActiveScroll(useSheetStore.getState());
  };

  /** 셀 커밋 — editable 열만 store에 반영 + history update push */
  const handleUpdateCell = (rowIndex: number, column: SheetColumnId, value: string) => {
    if (!isEditableColumn(column)) return false;

    const store = useSheetStore.getState();
    const sheet = store.sheets[store.active];
    const before = sheet?.timelines[rowIndex];
    if (!before) return false;

    // update 커밋 — mutate 전 검색 패널 닫기
    closeSearchPanel();

    const ok = updateActiveCellAction(rowIndex, column, value);
    if (!ok) return false;

    const after = useSheetStore.getState().sheets[store.active]?.timelines[rowIndex];
    if (!after) return true;

    const col = getEditableColIndex(format, column);
    useSheetHistoryStore
      .getState()
      .pushHistory(
        buildUpdateEntry(rowIndex, before, after, { row: rowIndex, col: col >= 0 ? col : 0 }),
      );
    if (column === 'starttime' || column === 'endtime') {
      syncVideoTimeSlotsAfterRowTimeEdit(rowIndex);
    }
    return true;
  };

  return {
    tabs: toSheetTabs(sheets),
    activeTabIndex: active,
    rows: getActiveSheetRows(state, format),
    activeScrollTop: getActiveScroll(state),
    handleScrollTopChange,
    handleSelectTab,
    handleAddTab,
    handleDeleteTab,
    handleRenameTab,
    handleCopyTab,
    handleUpdateCell,
  };
};

export { useSheets };
