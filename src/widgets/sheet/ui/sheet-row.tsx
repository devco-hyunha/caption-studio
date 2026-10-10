import { cn } from '@/shared/lib/utils';
import { getColumns, isTextColumn } from '../lib/columns';
import { getCellValue } from '../lib/get-cell-value';
import type { SheetRowProps } from '../types';
import { SheetCell } from './sheet-cell';

/** 시트 행 — 포맷의 열을 순회해 셀 생성. 선택 행은 bg-[#cef] */
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
				row.isSelected && 'bg-[#cef]',
				row.isError && !row.isSelected && 'bg-red-50',
			)}
			style={style}
		>
			{columns.map((column) => {
				const value = getCellValue(row, column.id);
				const isCurrent = currentColumn === column.id;
				const indexStickyClass =
					column.id === 'index'
						? cn(
								row.isSelected && 'bg-[#cef]',
								row.isError && !row.isSelected && 'bg-red-50',
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
