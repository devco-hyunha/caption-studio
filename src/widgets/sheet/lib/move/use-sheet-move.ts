import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ShortcutKeyHandler } from '@/features/shortkey';
import type {
	MoveCalc,
	SheetMoveCursor,
	UseSheetMoveParams,
	UseSheetMoveResult,
} from '../../types';
import { useLatestRef } from '@/shared/lib/react/use-latest-ref';
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

const noopHandler: ShortcutKeyHandler = () => {};

const createEmptyHandlers = (): UseSheetMoveResult => ({
	moveTabNext: noopHandler,
	moveTabPrev: noopHandler,
	moveRowPrev: noopHandler,
	moveRowNext: noopHandler,
	moveColPrev: noopHandler,
	moveColNext: noopHandler,
	movePagePrev: noopHandler,
	movePageNext: noopHandler,
});

/**
 * Tab / Arrow / Page 셀·행 이동 API.
 * 전역 keydown은 shortkey가 소유한다.
 * 핸들러는 layout effect에서 조립 — 렌더 본문에서 ref·`performance.now`를 읽지 않는다.
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
	const rowsRef = useLatestRef(rows);
	const formatRef = useLatestRef(format);
	const isEditingRef = useLatestRef(isEditing);
	const endEditRef = useLatestRef(endEdit);
	const applyFocusRef = useLatestRef(applyFocus);
	const onAppendRowRef = useLatestRef(onAppendRow);
	const onRowMovedRef = useLatestRef(onRowMoved);
	const lastMoveAtRef = useRef(0);

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

	const [handlers, setHandlers] = useState<UseSheetMoveResult>(createEmptyHandlers);

	useLayoutEffect(() => {
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

		/** 공통 가드(throttle·cursor) 후 이동 계산 실행 */
		const makeMove = (
			calc: MoveCalc,
			options: { endEdit?: boolean; notify?: boolean } = {},
		): ShortcutKeyHandler => (event) => {
			if (shouldThrottle(event)) return;
			const cursor = cursorRef.current;
			if (!cursor) return;

			if (options.endEdit) endEditIfNeeded();

			const next = calc(cursor);
			if (!next) return;
			if (next === 'append') {
				onAppendRowRef.current?.(cursor);
				return;
			}

			applyCursor(next.cursor, next.scrollTop);
			if (options.notify) notifyRowMoved(next.cursor.row, event);
		};

		const rowNextCalc = (append: boolean): MoveCalc => (cursor) => {
			const next = calcRowNext(cursor, getLastIndex(rowsRef.current), append);
			if (next === 'append') return 'append';
			return next ? { cursor: next } : null;
		};

		const rowPrevCalc: MoveCalc = (cursor) => {
			const next = calcRowPrev(cursor);
			return next ? { cursor: next } : null;
		};

		const pageCalc = (prev: boolean): MoveCalc => (cursor) => {
			const body = scrollRef.current;
			const view = { viewTop: body?.scrollTop ?? 0, viewHeight: body?.clientHeight ?? 0 };
			const result = prev
				? calcPagePrev(rowsRef.current, cursor.row, view)
				: calcPageNext(rowsRef.current, cursor.row, view);
			return result ? { cursor: { row: result.row, col: cursor.col }, scrollTop: result.scrollTop } : null;
		};

		const colPrevCalc: MoveCalc = (cursor) => {
			const next = calcColPrev(formatRef.current, cursor);
			return next ? { cursor: next } : null;
		};

		const colNextCalc: MoveCalc = (cursor) => {
			const next = calcColNext(formatRef.current, cursor, getLastIndex(rowsRef.current));
			return next ? { cursor: next } : null;
		};

		setHandlers({
			moveTabNext: makeMove(rowNextCalc(true), { endEdit: true }),
			moveTabPrev: makeMove(rowPrevCalc, { endEdit: true }),
			movePagePrev: makeMove(pageCalc(true), { endEdit: true }),
			movePageNext: makeMove(pageCalc(false), { endEdit: true }),
			moveRowPrev: makeMove(rowPrevCalc, { notify: true }),
			moveRowNext: makeMove(rowNextCalc(false), { notify: true }),
			moveColPrev: makeMove(colPrevCalc),
			moveColNext: makeMove(colNextCalc),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 핸들러는 ref로 최신값을 읽는 mount-only 조립
	}, []);

	return handlers;
};

export { useSheetMove };
