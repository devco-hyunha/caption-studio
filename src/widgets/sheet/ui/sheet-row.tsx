import { cn } from '@/shared/lib/utils';
import { getColumns, isTextColumn } from '../lib/columns/columns';
import { getCellValue } from '../lib/cell/get-cell-value';
import type { SheetRowProps } from '../types';
import { SheetCell } from './sheet-cell';

/** 시트 행 — 포맷의 열을 순회해 셀 생성. 선택 행은 bg-[#cef] */
const SheetRow = ({
  format,
  row,
  style,
  'data-index': dataIndex,
  currentColumn,
  searchHitKeys,
  cellEvents,
}: SheetRowProps) => {
  const columns = getColumns(format);

  return (
    <div
      role="row"
      data-slot="sheet-row"
      data-index={dataIndex}
      data-row={row.index}
      aria-rowindex={row.index + 1}
      aria-selected={row.isSelected || undefined}
      data-playback-active={row.isPlaybackActive || undefined}
      className={cn(
        'relative flex w-full min-w-[var(--sheet-contain-min)] items-stretch border-b border-neutral-100',
        row.isSelected && 'bg-[#cef]',
        row.isError && !row.isSelected && 'bg-red-50',
        row.isPlaybackActive && !row.isSelected && 'bg-sky-50',
        row.isPlaybackActive && 'shadow-[inset_3px_0_0_0] shadow-sky-500',
      )}
      style={style}
    >
      {columns.map((column) => {
        const value = getCellValue(row, column.id);
        const isCurrent = currentColumn === column.id;
        const isSearchHit = searchHitKeys?.has(`${row.index}:${column.id}`) === true;
        const indexStickyClass =
          column.id === 'index'
            ? cn(
                row.isSelected && 'bg-[#cef]',
                row.isError && !row.isSelected && 'bg-red-50',
                row.isPlaybackActive && !row.isSelected && 'bg-sky-50',
              )
            : undefined;

        if (isTextColumn(column.id)) {
          return (
            <SheetCell
              key={column.id}
              column={column.id}
              rowIndex={row.index}
              editable={column.editable}
              isCurrent={isCurrent}
              isSearchHit={isSearchHit}
              html={value}
              className={indexStickyClass}
              cellEvents={cellEvents}
            />
          );
        }

        return (
          <SheetCell
            key={column.id}
            column={column.id}
            rowIndex={row.index}
            editable={column.editable}
            isCurrent={isCurrent}
            isSearchHit={isSearchHit}
            className={indexStickyClass}
            cellEvents={cellEvents}
          >
            {value}
          </SheetCell>
        );
      })}
    </div>
  );
};

export { SheetRow };
