import type { CSSProperties } from 'react';
import { DEFAULT_ESTIMATE_ROW_HEIGHT } from '../../lib/columns/columns';
import type { SheetBodyRowsProps } from '../../types';
import { SheetRow } from '../sheet-row';

/**
 * sheet-body 행 렌더 셸 — 윈도 indices만 SheetRow로 렌더하는 presentational 컴포넌트.
 * totalHeight·paddingTop CSS 변수 주입, 행 높이·재생 highlight·검색 히트·셀 이벤트는 props 소비.
 */
const SheetBodyRows = ({
  format,
  rows,
  indices,
  totalHeight,
  paddingTop,
  estimateRowHeight,
  currentRowIndex,
  currentColumn,
  searchHitKeys,
  cellEvents,
  playbackSet,
}: SheetBodyRowsProps) => (
  <div
    data-slot="sheet-panel-body"
    className="relative box-border w-full min-w-full"
    style={
      {
        '--sheet-panel-height': `${totalHeight}px`,
        '--sheet-window-padding-top': `${paddingTop}px`,
        height: 'var(--sheet-panel-height)',
        paddingTop: 'var(--sheet-window-padding-top)',
      } as CSSProperties
    }
  >
    {indices.map((rowIndex) => {
      const row = rows[rowIndex];
      if (!row) return null;

      const rowHeight = row.height ?? estimateRowHeight ?? DEFAULT_ESTIMATE_ROW_HEIGHT;
      const rowView = playbackSet.has(row.index) ? { ...row, isPlaybackActive: true } : row;

      return (
        <SheetRow
          key={row.index}
          format={format}
          row={rowView}
          data-index={rowIndex}
          currentColumn={currentRowIndex === row.index ? currentColumn : null}
          searchHitKeys={searchHitKeys}
          cellEvents={cellEvents}
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
);

export { SheetBodyRows };
