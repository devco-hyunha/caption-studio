import { cn } from '@/shared/lib/utils';
import { getColumns } from '../lib/columns';
import type { SheetHeaderProps } from '../types';
import { SheetCell } from './sheet-cell';

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
				<SheetCell
					key={column.id}
					column={column.id}
					className={cn(
						'border-transparent border-b-neutral-300 pb-px text-center',
						column.id === 'index' && 'sticky left-0 z-20 justify-end text-right',
						column.id === 'memo' && 'border-r-neutral-300',
					)}
				>
					{column.label}
				</SheetCell>
			))}
		</div>
	);
};

export { SheetHeader };
