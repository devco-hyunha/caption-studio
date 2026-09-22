import type { MouseEvent } from 'react';
import { cn } from '@/shared/lib/utils';
import type { SheetCellProps, SheetColumnId } from '../types';

const COLUMN_FLEX: Record<SheetColumnId, string> = {
	index:
		'w-[var(--sheet-col-index)] shrink-0 grow-0 basis-[var(--sheet-col-index)] justify-end text-right',
	starttime:
		'w-[var(--sheet-col-starttime)] shrink-0 grow-0 basis-[var(--sheet-col-starttime)] justify-end text-right tabular-nums',
	endtime:
		'w-[var(--sheet-col-endtime)] shrink-0 grow-0 basis-[var(--sheet-col-endtime)] justify-end text-right tabular-nums',
	dur: 'w-[var(--sheet-col-dur)] shrink-0 grow-0 basis-[var(--sheet-col-dur)] justify-end text-right tabular-nums',
	text: 'w-[var(--sheet-col-text)] shrink-0 grow-0 basis-[var(--sheet-col-text)]',
	memo: 'min-w-[var(--sheet-col-memo)] shrink-0 grow basis-[var(--sheet-col-memo)]',
};

const isHtmlColumn = (column: SheetColumnId) => column === 'text' || column === 'memo';

const SheetCell = ({
	column,
	rowIndex = 0,
	children,
	html,
	editable = false,
	isCurrent = false,
	className,
	tabIndex = -1,
	onCellClick,
	onCellDoubleClick,
	onCellContextMenu,
}: SheetCellProps) => {
	const shouldRenderHtml = isHtmlColumn(column) && html != null;

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		onCellClick?.(event, rowIndex, column);
	};

	const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
		onCellDoubleClick?.(event, rowIndex, column);
	};

	const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
		onCellContextMenu?.(event, rowIndex, column);
	};

	return (
		<div
			role={editable ? 'gridcell' : undefined}
			data-slot="sheet-cell"
			data-column={column}
			data-row={rowIndex}
			data-editable={editable || undefined}
			tabIndex={editable ? tabIndex : undefined}
			className={cn(
				'flex items-stretch border-r border-neutral-200/75 outline-none select-none',
				'p-[var(--sheet-cell-padding,3px)]',
				COLUMN_FLEX[column],
				column === 'index' && 'sticky left-0 z-10 bg-white',
				editable && 'cursor-cell',
				isCurrent && 'bg-sky-100',
				className,
			)}
			onClick={editable ? handleClick : undefined}
			onDoubleClick={editable ? handleDoubleClick : undefined}
			onContextMenu={editable ? handleContextMenu : undefined}
			onKeyDown={
				editable
					? (event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								onCellDoubleClick?.(
									event as unknown as MouseEvent<HTMLDivElement>,
									rowIndex,
									column,
								);
							}
						}
					: undefined
			}
		>
			{shouldRenderHtml ? (
				<div
					data-slot="sheet-cell-content"
					className={cn(
						'min-w-0 flex-1 overflow-hidden break-words whitespace-normal',
						'[&_b]:font-bold [&_i]:italic [&_u]:underline',
					)}
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<div data-slot="sheet-cell-content" className="min-w-0 flex-1 truncate whitespace-nowrap">
					{children}
				</div>
			)}
		</div>
	);
};

export { SheetCell };
