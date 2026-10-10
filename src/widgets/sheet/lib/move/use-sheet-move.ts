import { useEffect, useRef } from 'react';
import type {
	SheetMoveCursor,
	UseSheetMoveParams,
} from '../../types';
import { isEditableDomTarget } from '../is-editable-dom-target';
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

/** 키 홀드(`event.repeat`) 최소 간격 — 중복 이벤트 걸러냄 */
const MOVE_REPEAT_INTERVAL_MS = 30;

/** 시트 이동 키 (Space는 다중 선택 토글이 별도 처리) */
const isSheetMoveKey = (key: string) =>
	key === 'Tab' ||
	key === 'ArrowUp' ||
	key === 'ArrowDown' ||
	key === 'ArrowLeft' ||
	key === 'ArrowRight' ||
	key === 'PageUp' ||
	key === 'PageDown';

/**
 * Tab / Arrow / Page 셀·행 이동 + Space 다중 선택 토글.
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
	onAppendRow,
	onRowMoved,
	onSpaceToggle,
}: UseSheetMoveParams) => {
	const modeRef = useRef(mode);
	const cursorRef = useRef<SheetMoveCursor | null>(null);
	const rowsRef = useRef(rows);
	const formatRef = useRef(format);
	const endEditRef = useRef(endEdit);
	const applyFocusRef = useRef(applyFocus);
	const onAppendRowRef = useRef(onAppendRow);
	const onRowMovedRef = useRef(onRowMoved);
	const onSpaceToggleRef = useRef(onSpaceToggle);
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
		onAppendRowRef.current = onAppendRow;
	}, [onAppendRow]);

	useEffect(() => {
		onRowMovedRef.current = onRowMoved;
	}, [onRowMoved]);

	useEffect(() => {
		onSpaceToggleRef.current = onSpaceToggle;
	}, [onSpaceToggle]);

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

		/** 커서 적용 — 포커스/스크롤 이동 후 커서·홀드 시각 갱신 */
		const applyCursor = (cursor: SheetMoveCursor, scrollTop?: number | null) => {
			const column = resolveColumn(cursor);
			if (!column) return;
			cursorRef.current = cursor;
			lastMoveAtRef.current = performance.now();
			applyFocusRef.current(cursor.row, column, { scrollTop });
		};

		/** 행 이동 통보 — 다중 선택 확장/앵커 이동 (Shift 여부 전달) */
		const notifyRowMoved = (row: number, event: KeyboardEvent) => {
			onRowMovedRef.current?.(row, event.shiftKey);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (isEditableDomTarget(event.target, { ignoreSheetCellEditor: true })) return;

			// Space: 다중 선택 중 현재 행 토글. 커스텀 키(ctrl+space 등)·편집 중 양보
			if (event.key === ' ') {
				if (event.ctrlKey || event.altKey || event.metaKey) return;
				if (modeRef.current === 'edit') return;
				const spaceCursor = cursorRef.current;
				if (!spaceCursor) return;
				event.preventDefault();
				onSpaceToggleRef.current?.(spaceCursor.row);
				return;
			}

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

				if (next == null) return;
				if (next === 'append') {
					onAppendRowRef.current?.(cursor);
					return;
				}
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
				notifyRowMoved(next.row, event);
				return;
			}

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				const next = moveRowNext(cursor, lastIndex, false);
				if (!next || next === 'append') return;
				applyCursor(next);
				notifyRowMoved(next.row, event);
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
