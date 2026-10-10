import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { COLUMN_WIDTHS, canEditColumnId, isTextColumn } from '../columns';
import { scrollColIntoView, scrollRowIntoView } from '../move/sheet-move';
import { resolveTarget, resolveTargetByIndex } from './edit-target';
import type {
	ApplyFocusOptions,
	SheetCellEditTarget,
	SheetCellEditorMode,
	SheetColumnId,
	SheetRowView,
	UseSheetCellFocusParams,
	UseSheetCellFocusResult,
} from '../../types';

/**
 * 시트 셀 포커스/스크롤 소유 hook.
 * mode/target 상태, 셀 좌표 계산, applyFocus(스크롤+포커스)를 담당한다.
 * 편집 수명 주기는 useSheetCellEditor가 이 결과를 소비한다.
 */
const useSheetCellFocus = ({
	format,
	rows,
	scrollRef,
	scrollContentRef,
	setScrollTop,
}: UseSheetCellFocusParams): UseSheetCellFocusResult => {
	const [mode, setMode] = useState<SheetCellEditorMode>('hidden');
	const [target, setTarget] = useState<SheetCellEditTarget | null>(null);

	const inputRef = useRef<HTMLDivElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const modeRef = useRef<SheetCellEditorMode>('hidden');
	const targetRef = useRef<SheetCellEditTarget | null>(null);
	const rowsRef = useRef<SheetRowView[]>(rows);
	const setScrollTopRef = useRef(setScrollTop);
	const focusSeqRef = useRef(0);
	const refineRafRef = useRef(0);

	useEffect(() => {
		modeRef.current = mode;
	}, [mode]);

	useEffect(() => {
		targetRef.current = target;
	}, [target]);

	useLayoutEffect(() => {
		rowsRef.current = rows;
	}, [rows]);

	useLayoutEffect(() => {
		setScrollTopRef.current = setScrollTop;
	}, [setScrollTop]);

	// unmount 시 refine raf 정리
	useEffect(() => {
		return () => {
			if (refineRafRef.current) {
				cancelAnimationFrame(refineRafRef.current);
				refineRafRef.current = 0;
			}
		};
	}, []);

	const findCellElement = (rowIndex: number, column: SheetColumnId) => {
		const root = scrollContentRef.current;
		if (!root) {
			return null;
		}
		return root.querySelector<HTMLElement>(
			`[data-slot="sheet-cell"][data-row="${rowIndex}"][data-column="${column}"]`,
		);
	};

	const resolveEstimatedTarget = (rowIndex: number, column: SheetColumnId) =>
		resolveTargetByIndex(rowsRef.current, format, rowIndex, column);

	const resolveMeasuredTarget = (rowIndex: number, column: SheetColumnId, cell: HTMLElement) => {
		const scrollContent = scrollContentRef.current;
		if (!scrollContent) return null;
		return resolveTarget(rowsRef.current, format, rowIndex, column, cell, scrollContent);
	};

	/** wrap이 포커스를 잃었을 때 편집 중 wrap으로 복귀 */
	const focusWrapIfNeeded = () => {
		const wrap = wrapRef.current;
		if (wrap && document.activeElement !== wrap) {
			wrap.focus({ preventScroll: true });
		}
	};

	/** text/memo는 input(IME), 그 외는 wrap으로 포커스 */
	const focusSelectionTarget = (column: SheetColumnId = targetRef.current?.column ?? 'text') => {
		const input = inputRef.current;
		if (isTextColumn(column)) {
			if (input && document.activeElement !== input) {
				input.focus({ preventScroll: true });
			}
			return;
		}
		focusWrapIfNeeded();
	};

	const focusTarget = (
		rowIndex: number,
		column: SheetColumnId,
		cell: HTMLElement | null = null,
	) => {
		const next =
			(cell != null ? resolveMeasuredTarget(rowIndex, column, cell) : null) ??
			resolveEstimatedTarget(rowIndex, column);
		if (!next) {
			return;
		}
		modeRef.current = 'focus';
		setTarget(next);
		setMode('focus');
		requestAnimationFrame(() => {
			focusSelectionTarget(column);
		});
	};

	/**
	 * 셀 포커스 진입: 스크롤 보정 후 target을 갱신하고 포커스를 이동한다.
	 * 1차 추정 좌표로 즉시 반영, 정밀 좌표는 rAF refine raf로 보정한다.
	 */
	const applyFocus = (rowIndex: number, column: SheetColumnId, options?: ApplyFocusOptions) => {
		if (!rowsRef.current[rowIndex] || !canEditColumnId(format, column)) {
			return;
		}

		const body = scrollRef.current;
		const viewHeight = body?.clientHeight ?? 0;
		let nextScroll =
			options?.scrollTop != null ? Math.max(0, options.scrollTop) : (body?.scrollTop ?? 0);

		if (options?.scrollTop != null) {
			setScrollTopRef.current(nextScroll);
		}

		const intoView = scrollRowIntoView(rowsRef.current, rowIndex, nextScroll, viewHeight);
		if (intoView.scrollTop != null) {
			nextScroll = intoView.scrollTop;
			setScrollTopRef.current(nextScroll);
		}

		const estimated = resolveEstimatedTarget(rowIndex, column);
		if (!estimated) return;

		const viewWidth = body?.clientWidth ?? 0;
		const viewLeft = body?.scrollLeft ?? 0;
		const stickyLeft = column === 'index' ? 0 : COLUMN_WIDTHS.index;
		const colIntoView = scrollColIntoView(
			estimated.left,
			estimated.minWidth,
			viewLeft,
			viewWidth,
			stickyLeft,
		);
		if (colIntoView.scrollLeft != null && body) {
			body.scrollLeft = colIntoView.scrollLeft;
		}

		const focusSeq = ++focusSeqRef.current;
		modeRef.current = 'focus';
		setTarget(estimated);
		setMode('focus');

		requestAnimationFrame(() => {
			focusSelectionTarget(column);
		});

		if (refineRafRef.current) {
			cancelAnimationFrame(refineRafRef.current);
		}
		refineRafRef.current = requestAnimationFrame(() => {
			refineRafRef.current = 0;
			if (focusSeq !== focusSeqRef.current) {
				return;
			}
			const cell = findCellElement(rowIndex, column);
			if (!cell) {
				return;
			}
			const measured = resolveMeasuredTarget(rowIndex, column, cell);
			if (!measured || focusSeq !== focusSeqRef.current) {
				return;
			}
			setTarget(measured);
		});
	};

	return {
		mode,
		target,
		inputRef,
		wrapRef,
		modeRef,
		targetRef,
		rowsRef,
		setMode,
		setTarget,
		findCellElement,
		resolveEstimatedTarget,
		resolveMeasuredTarget,
		focusWrapIfNeeded,
		focusSelectionTarget,
		focusTarget,
		applyFocus,
	};
};

export { useSheetCellFocus };
