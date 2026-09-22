import { useEffect, useRef } from 'react';
import type {
	SheetMoveCursor,
	UseSheetMoveParams,
} from '../types';
import {
	getEditableColIndex,
	getEditableColumn,
	getLastIndex,
	moveColNext,
	moveColPrev,
	movePageNext,
	movePagePrev,
	moveRowNext,
	moveRowPrev,
} from './sheet-move';

const isEditableDomTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	if (target.closest('[data-slot="sheet-cell-editor"]')) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

/** 키 홀드(`event.repeat`) 최소 간격 — 중복 이벤트 걸러냄 */
const MOVE_REPEAT_INTERVAL_MS = 30;

const isSheetMoveKey = (key: string) =>
	key === 'Tab' ||
	key === 'ArrowUp' ||
	key === 'ArrowDown' ||
	key === 'ArrowLeft' ||
	key === 'ArrowRight' ||
	key === 'PageUp' ||
	key === 'PageDown';

/**
 * Tab / Arrow / Page 셀·행 이동.
 * (Shift+Arrow multiple · Tab 마지막 행 insert는 미이전)
 */
const useSheetMove = ({
	format,
	rows,
	mode,
	currentRowIndex,
	currentColumn,
	scrollRef,
	endEdit,
	applyFocus,
}: UseSheetMoveParams) => {
	const modeRef = useRef(mode);
	const cursorRef = useRef<SheetMoveCursor | null>(null);
	const rowsRef = useRef(rows);
	const formatRef = useRef(format);
	const endEditRef = useRef(endEdit);
	const applyFocusRef = useRef(applyFocus);
	const lastMoveAtRef = useRef(0);

	useEffect(() => {
		modeRef.current = mode;
	}, [mode]);

	useEffect(() => {
		rowsRef.current = rows;
	}, [rows]);

	useEffect(() => {
		formatRef.current = format;
	}, [format]);

	useEffect(() => {
		endEditRef.current = endEdit;
	}, [endEdit]);

	useEffect(() => {
		applyFocusRef.current = applyFocus;
	}, [applyFocus]);

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

	useEffect(() => {
		if (mode === 'hidden') return;

		const resolveColumn = (cursor: SheetMoveCursor) =>
			getEditableColumn(formatRef.current, cursor.col);

		const applyCursor = (cursor: SheetMoveCursor, scrollTop?: number | null) => {
			const column = resolveColumn(cursor);
			if (!column) return;
			cursorRef.current = cursor;
			lastMoveAtRef.current = performance.now();
			applyFocusRef.current(cursor.row, column, { scrollTop });
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (isEditableDomTarget(event.target)) return;
			if (!isSheetMoveKey(event.key)) return;

			// 홀드 반복만 throttle — 첫 입력은 즉시
			if (event.repeat) {
				const elapsed = performance.now() - lastMoveAtRef.current;
				if (elapsed < MOVE_REPEAT_INTERVAL_MS) {
					event.preventDefault();
					return;
				}
			}

			const cursor = cursorRef.current;
			if (!cursor) return;

			const isEditing = modeRef.current === 'edit';
			const lastIndex = getLastIndex(rowsRef.current);
			const body = scrollRef.current;
			const viewTop = body?.scrollTop ?? 0;
			const viewHeight = body?.clientHeight ?? 0;

			if (event.key === 'Tab') {
				event.preventDefault();
				if (isEditing) endEditRef.current(true);

				const next = event.shiftKey ? moveRowPrev(cursor) : moveRowNext(cursor, lastIndex, true);

				if (next == null || next === 'append') return;
				applyCursor(next);
				return;
			}

			if (event.key === 'PageUp') {
				event.preventDefault();
				if (isEditing) endEditRef.current(true);
				const result = movePagePrev(rowsRef.current, cursor.row, {
					viewTop,
					viewHeight,
				});
				if (!result) return;
				applyCursor({ row: result.row, col: cursor.col }, result.scrollTop);
				return;
			}

			if (event.key === 'PageDown') {
				event.preventDefault();
				if (isEditing) endEditRef.current(true);
				const result = movePageNext(rowsRef.current, cursor.row, {
					viewTop,
					viewHeight,
				});
				if (!result) return;
				applyCursor({ row: result.row, col: cursor.col }, result.scrollTop);
				return;
			}

			// 편집 중 Arrow 이동 없음
			if (isEditing) return;

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				const next = moveRowPrev(cursor);
				if (!next) return;
				applyCursor(next);
				return;
			}

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				const next = moveRowNext(cursor, lastIndex, false);
				if (!next || next === 'append') return;
				applyCursor(next);
				return;
			}

			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				const next = moveColPrev(formatRef.current, cursor);
				if (!next) return;
				applyCursor(next);
				return;
			}

			if (event.key === 'ArrowRight') {
				event.preventDefault();
				const next = moveColNext(formatRef.current, cursor, lastIndex);
				if (!next) return;
				applyCursor(next);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [mode, scrollRef]);
};

export { useSheetMove };
export { MOVE_REPEAT_INTERVAL_MS };
