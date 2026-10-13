import type { ErrorRowLike, SearchHit } from '../types';

/** error-search 히트 — col 0 (첫 editable 열). `/` errorRows.map({row, col:0}) parity */
const findErrorHits = (rows: readonly ErrorRowLike[]): SearchHit[] =>
  rows
    .filter((row) => row.isError === true)
    .map((row) => ({ row: row.index, col: 0 }))
    .sort((a, b) => a.row - b.row);

/** error 개수 — `/` `.error-count` 라벨 (0이면 라벨 숨김) */
const countErrorRows = (rows: readonly ErrorRowLike[]): number =>
  rows.filter((row) => row.isError === true).length;

export { countErrorRows, findErrorHits };
