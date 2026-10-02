import { useEffect, useRef } from 'react';
import type {
	SheetMoveCursor,
	UseSheetMoveParams,
	UseSheetMoveResult,
} from '../types';
import type { ShortcutKeyHandler } from '@/features/shortkey';
import {
	getEditableColIndex,
	getEditableColumn,
	getLastIndex,
	moveColNext as calcColNext,
	moveColPrev as calcColPrev,
	movePageNext as calcPageNext,
	movePagePrev as calcPagePrev,
	moveRowNext as calcRowNext,
	moveRowPrev as calcRowPrev,
} from './sheet-move';

/** 키 홀드(`event.repeat`) 최소 간격 — 중복 이벤트 걸러냄 */
const MOVE_REPEAT_INTERVAL_MS = 30;

/**
 * Tab / Arrow / Page 셀·행 이동 API.
 * 전역 keydown은 shortkey가 소유한다.
 */
const useSheetMove = ({
	format,
	rows,
	isEditing,
	currentRowIndex,
	currentColumn,
	scrollRef,
	endEdit,
	applyFocus,
	onAppendRow,
	onRowMoved,
}: UseSheetMoveParams): UseSheetMoveResult => {
	const cursorRef = useRef<SheetMoveCursor | null>(null);
	const rowsRef = useRef(rows);
	const formatRef = useRef(format);
	const isEditingRef = useRef(isEditing);
	const endEditRef = useRef(endEdit);
	const applyFocusRef = useRef(applyFocus);
	const onAppendRowRef = useRef(onAppendRow);
	const onRowMovedRef = useRef(onRowMoved);
	const lastMoveAtRef = useRef(0);

	useEffect(() => {
		rowsRef.current = rows;
	}, [rows]);

	useEffect(() => {
		formatRef.current = format;
	}, [format]);

	useEffect(() => {
		isEditingRef.current = isEditing;
	}, [isEditing]);

	useEffect(() => {
		endEditRef.current = endEdit;
	}, [endEdit]);

	useEffect(() => {
		applyFocusRef.current = applyFocus;
	}, [applyFocus]);

	useEffect(() => {
		onAppendRowRef.current = onAppendRow;
	}, [onAppendRow]);

	useEffect(() => {
		onRowMovedRef.current = onRowMoved;
	}, [onRowMoved]);

	useEffect(() => {
		if (currentRowIndex == null || currentColumn == null) {
			cursorRef.current = null;
			return;
		}
		const col = getEditableColIndex(format, currentColumn);
		if (col < 0) {
			cursorRef.current = null;
			return;
		}
		cursorRef.current = { row: currentRowIndex, col };
	}, [currentRowIndex, currentColumn, format]);

	const shouldThrottle = (event: KeyboardEvent) => {
		if (!event.repeat) return false;
		return performance.now() - lastMoveAtRef.current < MOVE_REPEAT_INTERVAL_MS;
	};

	const resolveColumn = (cursor: SheetMoveCursor) =>
		getEditableColumn(formatRef.current, cursor.col);

	const applyCursor = (cursor: SheetMoveCursor, scrollTop?: number | null) => {
		const column = resolveColumn(cursor);
		if (!column) return;
		cursorRef.current = cursor;
		lastMoveAtRef.current = performance.now();
		applyFocusRef.current(cursor.row, column, { scrollTop });
	};

	const endEditIfNeeded = () => {
		if (isEditingRef.current()) endEditRef.current(true);
	};

	const notifyRowMoved = (row: number, event: KeyboardEvent) => {
		onRowMovedRef.current?.(row, event.shiftKey);
	};

	const moveTabNext: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;

		endEditIfNeeded();

		const lastIndex = getLastIndex(rowsRef.current);
		const next = calcRowNext(cursor, lastIndex, true);
		if (next == null) return;
		if (next === 'append') {
			onAppendRowRef.current?.(cursor);
			return;
		}
		applyCursor(next);
	};

	const moveTabPrev: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;

		endEditIfNeeded();

		const next = calcRowPrev(cursor);
		if (!next) return;
		applyCursor(next);
	};

	const movePagePrev: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;

		endEditIfNeeded();

		const body = scrollRef.current;
		const result = calcPagePrev(rowsRef.current, cursor.row, {
			viewTop: body?.scrollTop ?? 0,
			viewHeight: body?.clientHeight ?? 0,
		});
		if (!result) return;
		applyCursor({ row: result.row, col: cursor.col }, result.scrollTop);
	};

	const movePageNext: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;

		endEditIfNeeded();

		const body = scrollRef.current;
		const result = calcPageNext(rowsRef.current, cursor.row, {
			viewTop: body?.scrollTop ?? 0,
			viewHeight: body?.clientHeight ?? 0,
		});
		if (!result) return;
		applyCursor({ row: result.row, col: cursor.col }, result.scrollTop);
	};

	const moveRowPrevAction: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;
		const next = calcRowPrev(cursor);
		if (!next) return;
		applyCursor(next);
		notifyRowMoved(next.row, event);
	};

	const moveRowNextAction: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;
		const lastIndex = getLastIndex(rowsRef.current);
		const next = calcRowNext(cursor, lastIndex, false);
		if (!next || next === 'append') return;
		applyCursor(next);
		notifyRowMoved(next.row, event);
	};

	const moveColPrevAction: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;
		const next = calcColPrev(formatRef.current, cursor);
		if (!next) return;
		applyCursor(next);
	};

	const moveColNextAction: ShortcutKeyHandler = (event) => {
		if (shouldThrottle(event)) return;
		const cursor = cursorRef.current;
		if (!cursor) return;
		const lastIndex = getLastIndex(rowsRef.current);
		const next = calcColNext(formatRef.current, cursor, lastIndex);
		if (!next) return;
		applyCursor(next);
	};

	return {
		moveTabNext,
		moveTabPrev,
		moveRowPrev: moveRowPrevAction,
		moveRowNext: moveRowNextAction,
		moveColPrev: moveColPrevAction,
		moveColNext: moveColNextAction,
		movePagePrev,
		movePageNext,
	};
};

export { useSheetMove };
export { MOVE_REPEAT_INTERVAL_MS };
