import { useLayoutEffect, useRef } from 'react';
import { getEditableColumn } from '../move/sheet-move';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { UsePendingFocusParams } from '../../types';

/**
 * 렌더 반영 후 포커스 대상 등록 — pendingFocus + layoutEffect(rows·totalHeight 가드).
 * 행 CRUD·undo/redo가 공유 (selection·undo 훅 중복 제거).
 */
const usePendingFocus = ({ format, rows, totalHeight, applyFocus }: UsePendingFocusParams) => {
  const pendingFocusRef = useRef<{ row: number; column: SheetColumnId } | null>(null);

  // 시트 렌더가 새 행을 반영한 뒤에 스크롤·포커스 (아니면 scrollHeight 클램프)
  useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    if (!rows[pending.row]) return;
    if (totalHeight + 0.5 < rows.reduce((sum, row) => sum + (row.height ?? 0), 0)) return;
    pendingFocusRef.current = null;
    applyFocus(pending.row, pending.column);
  }, [rows, totalHeight, applyFocus]);

  const focusAfter = (row: number, col: number) => {
    const column = getEditableColumn(format, col);
    if (!column) return;
    pendingFocusRef.current = { row, column };
  };

  return { focusAfter };
};

export { usePendingFocus };
