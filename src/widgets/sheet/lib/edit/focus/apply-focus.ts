import type {
  FocusBodyMetrics,
  FocusScrollResult,
  SheetColumnId,
  SheetFormat,
  SheetRowView,
} from '../../../types';
import { COLUMN_WIDTHS } from '../../columns';
import { scrollColIntoView, scrollRowIntoView } from '../../move/sheet-move';
import { resolveTargetByIndex } from './edit-target';

/**
 * applyFocus 스크롤 계산 — body 실측값 기준 row/col into-view.
 * target은 DOM 없는 추정 좌표(1차), refine은 훅에서 실측 보정.
 * @param metrics.scrollTop — options.scrollTop 반영된 현재 스크롤
 */
const computeFocusScroll = (
  rows: readonly SheetRowView[],
  format: SheetFormat,
  rowIndex: number,
  column: SheetColumnId,
  metrics: FocusBodyMetrics,
): FocusScrollResult | null => {
  const target = resolveTargetByIndex(rows, format, rowIndex, column);
  if (!target) return null;

  const rowScroll = scrollRowIntoView(
    rows,
    rowIndex,
    metrics.scrollTop,
    metrics.clientHeight,
  ).scrollTop;

  const stickyLeft = column === 'index' ? 0 : COLUMN_WIDTHS.index;
  const scrollLeft = scrollColIntoView(
    target.left,
    target.minWidth,
    metrics.scrollLeft,
    metrics.clientWidth,
    stickyLeft,
  ).scrollLeft;

  return { target, rowScroll, scrollLeft };
};

export { computeFocusScroll };
