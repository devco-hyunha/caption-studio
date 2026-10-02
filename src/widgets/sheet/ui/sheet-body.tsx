import type { CSSProperties, UIEvent } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetShortkey, type SheetShortkeyActions } from '@/features/shortkey';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import {
	applyTextFormatCommand,
	type TextFormatCommand,
} from '../lib/apply-text-format';
import { DEFAULT_ESTIMATE_ROW_HEIGHT } from '../lib/columns';
import { getEditableColIndex, getEditableColumn } from '../lib/sheet-move';
import { useSheetCellEdit } from '../lib/use-sheet-cell-edit';
import { useSheetMove } from '../lib/use-sheet-move';
import { useSheetWindow } from '../lib/use-sheet-window';
import type { SheetBodyProps, SheetColumnId, SheetMoveCursor } from '../types';
import { SheetCellEditor } from './sheet-cell-editor';
import { SheetRow } from './sheet-row';

/**
 * 시트 body 윈도 + 행 렌더.
 * - page(viewport×3) 스냅 · paddingTop 흐름 레이아웃
 * - 탭별 scrollTop 복원
 * - 셀 더블클릭/우클릭/문자 입력 편집 · blur 저장
 * - 키보드 진입은 shortkey (이동 · 에딧 · 선택 · mutate)
 * - Verify용 임시 버튼 (툴바 셸과 별도)
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
	/** insert 직후 rows 커밋을 기다렸다가 포커스 (동기 applyFocus는 구 rows로 early return) */
	const pendingFocusRef = useRef<{ row: number; column: SheetColumnId } | null>(null);
	const { scrollRef, sheetWindow, handleScroll, setScrollTop } = useSheetWindow({
		rows,
		restoreScrollTop: scrollTop,
		restoreKey: scrollRestoreKey,
		onScrollTopChange,
	});

	const multipleActive = useSheetStore(
		(state) => state.sheets[state.active]?.multipleActive === true,
	);
	const toggleMultipleAction = useSheetStore((state) => state.toggleMultiple);
	const toggleSelectedRowAction = useSheetStore((state) => state.toggleSelectedRow);
	const setMultipleStartAction = useSheetStore((state) => state.setMultipleStart);
	const insertTimelineAfterAction = useSheetStore((state) => state.insertTimelineAfter);
	const removeTimelineAtAction = useSheetStore((state) => state.removeTimelineAt);
	const updateSelectedTextsAction = useSheetStore((state) => state.updateSelectedTexts);
	const updateActiveCellAction = useSheetStore((state) => state.updateActiveCell);

	const {
		mode,
		target,
		inputRef,
		wrapRef,
		currentRowIndex,
		currentColumn,
		isEditing,
		isTextTarget,
		hasFocus,
		endEdit,
		beginEdit,
		cancelEdit,
		beginEditFromTyping,
		insertEditorLineBreak,
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

	useLayoutEffect(() => {
		const pending = pendingFocusRef.current;
		if (!pending) return;
		if (!rows[pending.row]) return;

		// sheetWindow.totalHeight가 새 행을 반영한 뒤에 스크롤·포커스 (아니면 scrollHeight 클램프)
		const contentHeight = rows.reduce((sum, row) => sum + (row.height ?? 0), 0);
		if (sheetWindow.totalHeight + 0.5 < contentHeight) return;

		pendingFocusRef.current = null;
		applyFocus(pending.row, pending.column);
	}, [rows, sheetWindow.totalHeight, applyFocus]);

	const resolveFocusRow = () => {
		if (currentRowIndex != null) return currentRowIndex;
		return 0;
	};

	const resolveFocusCol = () => {
		if (currentColumn == null) return 0;
		const index = getEditableColIndex(format, currentColumn);
		return index >= 0 ? index : 0;
	};

	const handleAppendRow = (cursor: SheetMoveCursor) => {
		const insertIndex = insertTimelineAfterAction(cursor.row, format);
		if (insertIndex == null) return;
		const column = getEditableColumn(format, cursor.col);
		if (!column) return;
		pendingFocusRef.current = { row: insertIndex, column };
	};

	const handleRowMoved = (row: number, withShift: boolean) => {
		const active = useSheetStore.getState().sheets[useSheetStore.getState().active];
		if (!active?.multipleActive) return;
		if (withShift) {
			toggleSelectedRowAction(row, true);
			return;
		}
		setMultipleStartAction(row);
	};

	const handleInsertAtFocus = () => {
		if (isEditing()) endEdit(true);
		const row = resolveFocusRow();
		const col = resolveFocusCol();
		const insertIndex = insertTimelineAfterAction(row, format);
		if (insertIndex == null) return;
		const column = getEditableColumn(format, col);
		if (!column) return;
		pendingFocusRef.current = { row: insertIndex, column };
	};

	const handleRemoveAtFocus = () => {
		if (isEditing()) endEdit(true);
		const row = resolveFocusRow();
		const col = resolveFocusCol();
		const focusRow = removeTimelineAtAction(row);
		if (focusRow == null) return;
		const column = getEditableColumn(format, col);
		if (!column) return;
		pendingFocusRef.current = { row: focusRow, column };
	};

	const handleToggleMultipleClick = () => {
		if (isEditing()) endEdit(true);
		toggleMultipleAction(resolveFocusRow());
	};

	const handleApplyTextFormat = (command: TextFormatCommand) => {
		// 에딧 중 — 레거시 clip: 현재 에디터에 execCommand
		if (isEditing()) {
			inputRef.current?.focus();
			document.execCommand(command, false);
			return;
		}

		const store = useSheetStore.getState();
		const sheet = store.sheets[store.active];
		if (!sheet) return;

		// multiple — 선택 행 text 일괄
		if (sheet.multipleActive) {
			updateSelectedTextsAction((text) => applyTextFormatCommand(text, command));
			return;
		}

		// 단건 — 레거시 clip (text 타깃)
		if (!isTextTarget()) return;
		const row = resolveFocusRow();
		const prev = typeof sheet.timelines[row]?.text === 'string' ? sheet.timelines[row].text! : '';
		const next = applyTextFormatCommand(prev, command);
		if (next === prev) return;
		updateActiveCellAction(row, 'text', next);
	};

	const move = useSheetMove({
		format,
		rows,
		isEditing,
		currentRowIndex,
		currentColumn,
		scrollRef,
		endEdit,
		applyFocus,
		onAppendRow: handleAppendRow,
		onRowMoved: handleRowMoved,
	});

	const getShortkeyActions = (): SheetShortkeyActions => ({
		isEditing,
		isTextTarget,
		hasFocus,
		isMultiple: () =>
			useSheetStore.getState().sheets[useSheetStore.getState().active]?.multipleActive ===
			true,
		endEdit,
		beginEdit,
		cancelEdit,
		beginEditFromTyping,
		insertEditorLineBreak,
		toggleMultiple: () => {
			if (isEditing()) endEdit(true);
			toggleMultipleAction(resolveFocusRow());
		},
		toggleRowSelect: () => {
			toggleSelectedRowAction(resolveFocusRow(), false);
		},
		insertRow: handleInsertAtFocus,
		removeRow: handleRemoveAtFocus,
		applyTextFormat: handleApplyTextFormat,
		moveTabNext: move.moveTabNext,
		moveTabPrev: move.moveTabPrev,
		moveRowPrev: move.moveRowPrev,
		moveRowNext: move.moveRowNext,
		moveColPrev: move.moveColPrev,
		moveColNext: move.moveColNext,
		movePagePrev: move.movePagePrev,
		movePageNext: move.movePageNext,
	});

	useSheetShortkey({ getActions: getShortkeyActions });

	const handleBodyScroll = (event: UIEvent<HTMLDivElement>) => {
		handleScroll();
		onHorizontalScroll?.(event.currentTarget.scrollLeft);
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
			<div
				role="toolbar"
				aria-label="Verify sheet controls"
				className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5"
			>
				<span className="text-muted-foreground text-xs">Verify</span>
				<Button
					type="button"
					size="sm"
					variant={multipleActive ? 'default' : 'outline'}
					aria-pressed={multipleActive}
					aria-label="Toggle multiple row select"
					onClick={handleToggleMultipleClick}
				>
					다중 선택
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					aria-label="Insert row after current"
					disabled={multipleActive}
					onClick={handleInsertAtFocus}
				>
					행 추가
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					aria-label="Remove current row"
					disabled={multipleActive}
					onClick={handleRemoveAtFocus}
				>
					행 삭제
				</Button>
				<span className="bg-border mx-1 h-4 w-px" aria-hidden />
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="font-bold"
					aria-label="Bold"
					onClick={() => handleApplyTextFormat('bold')}
				>
					B
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="italic"
					aria-label="Italic"
					onClick={() => handleApplyTextFormat('italic')}
				>
					I
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="underline"
					aria-label="Underline"
					onClick={() => handleApplyTextFormat('underline')}
				>
					U
				</Button>
			</div>
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
		</div>
	);
};

export { SheetBody };
