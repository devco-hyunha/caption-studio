import type { CSSProperties } from 'react';
import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import {
	DEFAULT_CELL_STYLE,
	DEFAULT_ESTIMATE_ROW_HEIGHT,
	DEFAULT_FONT_SIZE,
	createColumnVars,
} from '../lib/columns';
import type { SheetPanelProps, SheetTabView } from '../types';
import { SheetBody } from './sheet-body';
import { SheetFooter } from './sheet-footer';
import { SheetHeader } from './sheet-header';

const DEFAULT_TABS: SheetTabView[] = [
	{ name: 'sheet1' },
	{ name: 'sheet2' },
	{ name: 'sheet3' },
];

const SheetPanel = ({
	format,
	rows,
	estimateRowHeight = DEFAULT_ESTIMATE_ROW_HEIGHT,
	tabs = DEFAULT_TABS,
	activeTabIndex = 0,
	scrollTop = 0,
	onScrollTopChange,
	onSelectTab,
	onAddTab,
	onDeleteTab,
	onRenameTab,
	onCopyTab,
	onUpdateCell,
	className,
	'aria-label': ariaLabel = 'Caption sheet',
}: SheetPanelProps) => {
	const columnVars = createColumnVars(format, DEFAULT_FONT_SIZE);
	const headPanelRef = useRef<HTMLDivElement>(null);
	const resolvedActiveIndex = Math.min(
		Math.max(0, activeTabIndex),
		Math.max(0, tabs.length - 1),
	);

	const handleHorizontalScroll = (scrollLeft: number) => {
		const headPanel = headPanelRef.current;
		if (!headPanel) return;

		// headPanel translateX(-scrollLeft)
		headPanel.style.transform = scrollLeft ? `translateX(${-scrollLeft}px)` : '';

		// 헤더는 body와 별도 스크롤이라 sticky 불가 — index만 역보정으로 고정
		const indexCell = headPanel.querySelector<HTMLElement>('[data-column="index"]');
		if (indexCell) {
			indexCell.style.transform = scrollLeft ? `translateX(${scrollLeft}px)` : '';
		}
	};

	return (
		<section
			data-slot="sheet-panel"
			data-format={format}
			aria-label={ariaLabel}
			className={cn(
				'flex h-full min-h-0 flex-col overflow-hidden border border-neutral-300 bg-white text-neutral-900',
				className,
			)}
			style={
				{
					...columnVars,
					'--sheet-font-size': `${DEFAULT_FONT_SIZE}px`,
					'--sheet-line-height': `${DEFAULT_CELL_STYLE.lineHeight}px`,
					'--sheet-cell-padding': `${DEFAULT_CELL_STYLE.padding}px`,
					fontSize: 'var(--sheet-font-size)',
					lineHeight: 'var(--sheet-line-height)',
				} as CSSProperties
			}
		>
			<div data-slot="sheet-head" className="shrink-0 overflow-hidden">
				<div
					ref={headPanelRef}
					data-slot="sheet-head-panel"
					className="will-change-transform"
				>
					<SheetHeader format={format} />
				</div>
			</div>
			<div
				role="grid"
				aria-rowcount={rows.length}
				aria-colcount={format === 'smi' ? 5 : 6}
				data-slot="sheet-grid"
				className="flex min-h-0 flex-1 flex-col overflow-hidden"
			>
				<SheetBody
					format={format}
					rows={rows}
					estimateRowHeight={estimateRowHeight}
					scrollTop={scrollTop}
					scrollRestoreKey={resolvedActiveIndex}
					onScrollTopChange={onScrollTopChange}
					onHorizontalScroll={handleHorizontalScroll}
					onUpdateCell={onUpdateCell}
				/>
			</div>
			<SheetFooter
				tabs={tabs}
				activeIndex={resolvedActiveIndex}
				onSelectTab={onSelectTab}
				onAddTab={onAddTab}
				onDeleteTab={onDeleteTab}
				onRenameTab={onRenameTab}
				onCopyTab={onCopyTab}
			/>
		</section>
	);
};

export { SheetPanel };
