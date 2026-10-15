import { sheetColumnKey, useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import type { SheetHeaderCellProps } from '../../types';
import { SheetCell } from '../sheet-cell';

/** 열 헤더 셀 — 포맷별 열 라벨 키 (`sheet.col.*`) */
const SheetHeaderCell = ({ id, format }: SheetHeaderCellProps) => {
  const label = useT(sheetColumnKey(id, format));
  return (
    <SheetCell
      column={id}
      className={cn(
        'border-transparent border-b-neutral-300 pb-px text-center',
        id === 'index' && 'sticky left-0 z-20 justify-end text-right',
        id === 'memo' && 'border-r-neutral-300',
      )}
    >
      {label}
    </SheetCell>
  );
};

export { SheetHeaderCell };
