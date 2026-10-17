import type { SheetCursor } from '@/shared/types/sheet-cursor';
import type { ErrorRowLike } from '../types';

/** error-search 히트 — col 0 (첫 editable 열) */
const findErrorHits = (rows: readonly ErrorRowLike[]): SheetCursor[] =>
  rows
    .filter((row) => row.isError === true)
    .map((row) => ({ row: row.index, col: 0 }))
    .sort((a, b) => a.row - b.row);

/** error 개수 (0이면 라벨 숨김) */
const countErrorRows = (rows: readonly ErrorRowLike[]): number =>
  rows.filter((row) => row.isError === true).length;

export { countErrorRows, findErrorHits };
