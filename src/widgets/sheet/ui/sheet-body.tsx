import type { CSSProperties, UIEvent } from 'react';
import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { DEFAULT_ESTIMATE_ROW_HEIGHT } from '../lib/columns';
import { useSheetCellEdit } from '../lib/use-sheet-cell-edit';
import { useSheetMove } from '../lib/use-sheet-move';
import { useSheetWindow } from '../lib/use-sheet-window';
import type { SheetBodyProps } from '../types';
import { SheetCellEditor } from './sheet-cell-editor';
import { SheetRow } from './sheet-row';

/**
 * 시트 body 윈도 + 행 렌더.
 * - page(viewport×3) 스냅 · paddingTop 흐름 레이아웃
 * - 탭별 scrollTop 복원
 * - 셀 더블클릭/우클릭/문자 입력 편집 · blur 저장
 * - Arrow / Tab / Page 포커스 이동
 */
const SheetBody = ({
	format,
	rows,
	estimateRowHeight,
	className,
	scrollTop = 0,
	scrollRestoreKey = 0,
	onScrollTopChange,
	onHorizontalScroll,
	onUpdateCell,
}: SheetBodyProps) => {
	const scrollContentRef = useRef<HTMLDivElement>(null);
	const { scrollRef, sheetWindow, handleScroll, setScrollTop } = useSheetWindow({
		rows,
		restoreScrollTop: scrollTop,
		restoreKey: scrollRestoreKey,
		onScrollTopChange,
	});

	const {
		mode,
		target,
		inputRef,
		wrapRef,
		currentRowIndex,
		currentColumn,
		endEdit,
		applyFocus,
		handleCellClick,
		handleCellDoubleClick,
		handleCellContextMenu,
		handleInputKeyDown,
		handleInputClick,
		handleEditorBlur,
	} = useSheetCellEdit({
		format,
		rows,
		scrollRef,
		scrollContentRef,
		setScrollTop,
		onCommitCell: (rowIndex, column, value) => onUpdateCell?.(rowIndex, column, value) ?? false,
	});

	useSheetMove({
		format,
		rows,
		mode,
		currentRowIndex,
		currentColumn,
		scrollRef,
		endEdit,
		applyFocus,
	});

	const handleBodyScroll = (event: UIEvent<HTMLDivElement>) => {
		handleScroll();
		onHorizontalScroll?.(event.currentTarget.scrollLeft);
	};

	return (
		<div
			ref={scrollRef}
			data-slot="sheet-body"
			role="presentation"
			className={cn('relative h-full min-h-0 flex-1 overflow-auto', className)}
			onScroll={handleBodyScroll}
		>
			<div
				ref={scrollContentRef}
				data-slot="sheet-body-scroll"
				className="relative w-full min-w-[var(--sheet-contain-min)]"
			>
				<SheetCellEditor
					mode={mode}
					left={target?.left}
					top={target?.top}
					minWidth={target?.minWidth}
					minHeight={target?.minHeight}
					wrapRef={wrapRef}
					inputRef={inputRef}
					onInputKeyDown={handleInputKeyDown}
					onInputClick={handleInputClick}
					onInputBlur={handleEditorBlur}
				/>
				<div
					data-slot="sheet-panel-body"
					className="relative box-border w-full min-w-full"
					style={
						{
							'--sheet-panel-height': `${sheetWindow.totalHeight}px`,
							'--sheet-window-padding-top': `${sheetWindow.paddingTop}px`,
							height: 'var(--sheet-panel-height)',
							paddingTop: 'var(--sheet-window-padding-top)',
						} as CSSProperties
					}
				>
					{sheetWindow.indices.map((rowIndex) => {
						const row = rows[rowIndex];
						if (!row) return null;

						const rowHeight =
							row.height ?? estimateRowHeight ?? DEFAULT_ESTIMATE_ROW_HEIGHT;

						return (
							<SheetRow
								key={row.index}
								format={format}
								row={row}
								data-index={rowIndex}
								currentColumn={
									currentRowIndex === row.index ? currentColumn : null
								}
								onCellClick={handleCellClick}
								onCellDoubleClick={handleCellDoubleClick}
								onCellContextMenu={handleCellContextMenu}
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
			</div>
		</div>
	);
};

export { SheetBody };
