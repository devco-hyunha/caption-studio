import { cn } from '@/shared/lib/utils';
import { getColumns } from '../../lib/columns/columns';
import type { SheetHeaderProps } from '../../types';
import { SheetHeaderCell } from './sheet-header-cell';

/** 시트 헤더 — 포맷의 열 라벨을 고정 폭으로 렌더 */
const SheetHeader = ({ format, className }: SheetHeaderProps) => {
  const columns = getColumns(format);

  return (
    <div
      role="row"
      data-slot="sheet-header"
      className={cn(
        'sticky top-0 z-10 flex w-full min-w-[var(--sheet-contain-min)] border-b border-neutral-300 bg-white font-bold text-neutral-700',
        className,
      )}
    >
      {columns.map((column) => (
        <SheetHeaderCell key={column.id} id={column.id} format={format} />
      ))}
    </div>
  );
};

export { SheetHeader };
