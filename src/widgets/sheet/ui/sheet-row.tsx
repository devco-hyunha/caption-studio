import { cn } from '@/shared/lib/utils';
import { getColumns } from '../lib/columns';
import type { SheetColumnId, SheetRowProps, SheetRowView } from '../types';
import { SheetCell } from './sheet-cell';

const getCellValue = (row: SheetRowView, column: SheetColumnId): string => {
	if (column === 'index') return String(row.index + 1);
	if (column === 'starttime') return row.starttime;
	if (column === 'endtime') return row.endtime;
	if (column === 'dur') return row.dur;
	if (column === 'text') return row.text;
	return row.memo;
};

const isHtmlColumn = (column: SheetColumnId) => column === 'text' || column === 'memo';

const SheetRow = ({
	format,
	row,
	style,
	'data-index': dataIndex,
	currentColumn,
	onCellClick,
	onCellDoubleClick,
	onCellContextMenu,
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
			className={cn(
				'relative flex w-full min-w-[var(--sheet-contain-min)] items-stretch border-b border-neutral-100',
				row.isSelected && 'bg-sky-100',
				row.isError && 'bg-red-50',
			)}
			style={style}
		>
			{columns.map((column) => {
				const value = getCellValue(row, column.id);
				const isCurrent = currentColumn === column.id;
				const indexStickyClass =
					column.id === 'index'
						? cn(
								row.isSelected && 'bg-sky-100',
								row.isError && !row.isSelected && 'bg-red-50',
							)
						: undefined;

				if (isHtmlColumn(column.id)) {
					return (
						<SheetCell
							key={column.id}
							column={column.id}
							rowIndex={row.index}
							editable={column.editable}
							isCurrent={isCurrent}
							html={value}
							className={indexStickyClass}
							onCellClick={onCellClick}
							onCellDoubleClick={onCellDoubleClick}
							onCellContextMenu={onCellContextMenu}
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
						className={indexStickyClass}
						onCellClick={onCellClick}
						onCellDoubleClick={onCellDoubleClick}
						onCellContextMenu={onCellContextMenu}
					>
						{value}
					</SheetCell>
				);
			})}
		</div>
	);
};

export { SheetRow };
