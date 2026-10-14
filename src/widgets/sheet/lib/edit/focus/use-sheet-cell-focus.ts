import { useEffect, useRef, useState } from 'react';
import { canEditColumnId, isTextColumn } from '../../columns/columns';
import { useLatestRef } from '@/shared/lib/react/use-latest-ref';
import { resolveTarget, resolveTargetByIndex } from './edit-target';
import { computeFocusScroll } from './apply-focus';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type {
  ApplyFocusOptions,
  FocusBodyMetrics,
  SheetCellEditTarget,
  SheetCellEditorMode,
  SheetRowView,
  UseSheetCellFocusParams,
  UseSheetCellFocusResult,
} from '../../../types';

/**
 * 시트 셀 포커스/스크롤 소유 hook.
 * mode/target 상태, 셀 좌표 계산, applyFocus(스크롤+포커스)를 담당한다.
 * 스크롤 계산은 apply-focus.computeFocusScroll(순수), 편집 수명 주기는 useSheetCellEditor가 소비한다.
 */
const useSheetCellFocus = ({
  format,
  rows,
  scrollRef,
  scrollContentRef,
  setScrollTop,
}: UseSheetCellFocusParams): UseSheetCellFocusResult => {
  const [mode, setMode] = useState<SheetCellEditorMode>('hidden');
  const [target, setTarget] = useState<SheetCellEditTarget | null>(null);

  const inputRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // mode/target은 핸들러에서 명령적 mutate — render sync는 IME composition 중 re-render로 되돌려짐
  const modeRef = useRef<SheetCellEditorMode>(mode);
  const targetRef = useRef<SheetCellEditTarget | null>(target);
  const rowsRef = useLatestRef<SheetRowView[]>(rows);
  const setScrollTopRef = useLatestRef(setScrollTop);
  const focusSeqRef = useRef(0);
  const refineRafRef = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // unmount 시 refine raf 정리
  useEffect(() => {
    return () => {
      if (refineRafRef.current) {
        cancelAnimationFrame(refineRafRef.current);
        refineRafRef.current = 0;
      }
    };
  }, []);

  const findCellElement = (rowIndex: number, column: SheetColumnId) => {
    const root = scrollContentRef.current;
    if (!root) {
      return null;
    }
    return root.querySelector<HTMLElement>(
      `[data-slot="sheet-cell"][data-row="${rowIndex}"][data-column="${column}"]`,
    );
  };

  const resolveEstimatedTarget = (rowIndex: number, column: SheetColumnId) =>
    resolveTargetByIndex(rowsRef.current, format, rowIndex, column);

  const resolveMeasuredTarget = (rowIndex: number, column: SheetColumnId, cell: HTMLElement) => {
    const scrollContent = scrollContentRef.current;
    if (!scrollContent) return null;
    return resolveTarget(rowsRef.current, format, rowIndex, column, cell, scrollContent);
  };

  /** wrap이 포커스를 잃었을 때 편집 중 wrap으로 복귀 */
  const focusWrapIfNeeded = () => {
    const wrap = wrapRef.current;
    if (wrap && document.activeElement !== wrap) {
      wrap.focus({ preventScroll: true });
    }
  };

  /** text/memo는 input(IME), 그 외는 wrap으로 포커스 */
  const focusSelectionTarget = (column: SheetColumnId = targetRef.current?.column ?? 'text') => {
    const input = inputRef.current;
    if (isTextColumn(column)) {
      if (input && document.activeElement !== input) {
        input.focus({ preventScroll: true });
      }
      return;
    }
    focusWrapIfNeeded();
  };

  const focusTarget = (
    rowIndex: number,
    column: SheetColumnId,
    cell: HTMLElement | null = null,
  ) => {
    const next =
      (cell != null ? resolveMeasuredTarget(rowIndex, column, cell) : null) ??
      resolveEstimatedTarget(rowIndex, column);
    if (!next) {
      return;
    }
    modeRef.current = 'focus';
    setTarget(next);
    setMode('focus');
    requestAnimationFrame(() => {
      focusSelectionTarget(column);
    });
  };

  /**
   * 셀 포커스 진입: 스크롤 보정 후 target을 갱신하고 포커스를 이동한다.
   * 1차 추정 좌표로 즉시 반영, 정밀 좌표는 rAF refine raf로 보정한다.
   */
  const applyFocus = (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => {
    if (!rowsRef.current[rowIndex] || !canEditColumnId(format, column)) {
      return;
    }

    const body = scrollRef.current;
    const nextScroll =
      options?.scrollTop != null ? Math.max(0, options.scrollTop) : (body?.scrollTop ?? 0);

    if (options?.scrollTop != null) {
      setScrollTopRef.current(nextScroll);
    }

    const metrics: FocusBodyMetrics = {
      scrollTop: nextScroll,
      scrollLeft: body?.scrollLeft ?? 0,
      clientHeight: body?.clientHeight ?? 0,
      clientWidth: body?.clientWidth ?? 0,
    };

    const result = computeFocusScroll(rowsRef.current, format, rowIndex, column, metrics);
    if (!result) return;

    if (result.rowScroll != null) {
      setScrollTopRef.current(result.rowScroll);
    }

    if (result.scrollLeft != null && body) {
      body.scrollLeft = result.scrollLeft;
    }

    const focusSeq = ++focusSeqRef.current;
    modeRef.current = 'focus';
    setTarget(result.target);
    setMode('focus');

    requestAnimationFrame(() => {
      focusSelectionTarget(column);
    });

    if (refineRafRef.current) {
      cancelAnimationFrame(refineRafRef.current);
    }
    refineRafRef.current = requestAnimationFrame(() => {
      refineRafRef.current = 0;
      if (focusSeq !== focusSeqRef.current) {
        return;
      }
      const cell = findCellElement(rowIndex, column);
      if (!cell) {
        return;
      }
      const measured = resolveMeasuredTarget(rowIndex, column, cell);
      if (!measured || focusSeq !== focusSeqRef.current) {
        return;
      }
      setTarget(measured);
    });
  };

  return {
    mode,
    target,
    inputRef,
    wrapRef,
    modeRef,
    targetRef,
    rowsRef,
    setMode,
    setTarget,
    findCellElement,
    resolveEstimatedTarget,
    resolveMeasuredTarget,
    focusWrapIfNeeded,
    focusSelectionTarget,
    focusTarget,
    applyFocus,
  };
};

export { useSheetCellFocus };
