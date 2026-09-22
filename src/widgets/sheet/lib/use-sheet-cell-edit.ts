import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type {
	SheetCellEditTarget,
	SheetCellEditorMode,
	SheetColumnId,
	SheetRowView,
	UseSheetCellEditParams,
	UseSheetCellEditResult,
} from '../types';
import { COLUMN_WIDTHS, getColumnLeft, isEditableColumn } from './columns';
import { encodeCellHtml } from './encode-cell-html';
import { getRowTop, scrollColIntoView, scrollRowIntoView } from './sheet-move';

const TEXT_COLUMNS: SheetColumnId[] = ['text', 'memo'];

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

const isTextColumn = (column: SheetColumnId) => TEXT_COLUMNS.includes(column);

const insertEditorLineBreak = () => {
	if (isFirefox) {
		document.execCommand('insertHTML', false, '<br />');
		return;
	}
	document.execCommand('insertLineBreak');
};

const isPrintableKey = (event: {
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	key: string;
	code: string;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean };
}) => {
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (event.isComposing || event.nativeEvent?.isComposing) return false;
	return event.key.length === 1 || event.code === 'Space';
};

/** IME 조합 시작(한글 등) — Process/229 또는 composing */
const isImeStartKey = (event: {
	key: string;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean; keyCode?: number };
	keyCode?: number;
}) => {
	if (event.isComposing || event.nativeEvent?.isComposing) return true;
	if (event.key === 'Process') return true;
	const keyCode = event.nativeEvent?.keyCode ?? event.keyCode;
	return keyCode === 229;
};

const shouldBeginEditFromKey = (event: {
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	key: string;
	code: string;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean; keyCode?: number };
	keyCode?: number;
}) => {
	if (event.key === 'Enter') return true;
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (isImeStartKey(event)) return true;
	return isPrintableKey(event);
};

const isEditableDomTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

const getCellValue = (row: SheetRowView, column: SheetColumnId): string => {
	if (column === 'index') return String(row.index + 1);
	if (column === 'starttime') return row.starttime;
	if (column === 'endtime') return row.endtime;
	if (column === 'dur') return row.dur;
	if (column === 'text') return row.text;
	return row.memo;
};

const measureCellPosition = (
	cell: HTMLElement,
	scrollContent: HTMLElement,
): { left: number; top: number; minWidth: number; minHeight: number } => {
	const cellRect = cell.getBoundingClientRect();
	const contentRect = scrollContent.getBoundingClientRect();

	return {
		left: cellRect.left - contentRect.left,
		top: cellRect.top - contentRect.top,
		minWidth: cell.offsetWidth,
		minHeight: cell.offsetHeight,
	};
};

const useSheetCellEdit = ({
	format,
	rows,
	scrollRef,
	scrollContentRef,
	setScrollTop,
	onCommitCell,
}: UseSheetCellEditParams): UseSheetCellEditResult => {
	const [mode, setMode] = useState<SheetCellEditorMode>('hidden');
	const [target, setTarget] = useState<SheetCellEditTarget | null>(null);
	const inputRef = useRef<HTMLDivElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const modeRef = useRef(mode);
	const targetRef = useRef(target);
	const rowsRef = useRef(rows);
	const setScrollTopRef = useRef(setScrollTop);
	const focusSeqRef = useRef(0);
	const refineRafRef = useRef<number | null>(null);
	/** 편집 진입 1회 부트스트랩 — Strict Mode 중복 effect 대비 */
	const editBootstrapRef = useRef<{ applied: boolean } | null>(null);

	useEffect(() => {
		modeRef.current = mode;
	}, [mode]);

	useEffect(() => {
		targetRef.current = target;
	}, [target]);

	useEffect(() => {
		rowsRef.current = rows;
	}, [rows]);

	useEffect(() => {
		setScrollTopRef.current = setScrollTop;
	}, [setScrollTop]);

	useEffect(
		() => () => {
			if (refineRafRef.current != null) cancelAnimationFrame(refineRafRef.current);
		},
		[],
	);

	const findCellElement = (rowIndex: number, column: SheetColumnId) => {
		const root = scrollContentRef.current;
		if (!root) return null;
		return root.querySelector<HTMLElement>(
			`[data-slot="sheet-cell"][data-row="${rowIndex}"][data-column="${column}"]`,
		);
	};

	/** DOM 없이 행 누적 높이·열 left로 즉시 좌표 산출 (키 반복 동기화) */
	const resolveTargetByIndex = (rowIndex: number, column: SheetColumnId) => {
		const row = rowsRef.current[rowIndex];
		if (!row) return null;

		return {
			rowIndex,
			column,
			left: getColumnLeft(format, column),
			top: getRowTop(rowsRef.current, rowIndex),
			minWidth: COLUMN_WIDTHS[column],
			minHeight: row.height,
			value: getCellValue(row, column),
		} satisfies SheetCellEditTarget;
	};

	const resolveTarget = (rowIndex: number, column: SheetColumnId, cell: HTMLElement) => {
		const scrollContent = scrollContentRef.current;
		if (!scrollContent) return null;

		const row = rowsRef.current[rowIndex];
		if (!row) return null;

		const measured = measureCellPosition(cell, scrollContent);
		return {
			rowIndex,
			column,
			left: measured.left,
			top: measured.top,
			minWidth: measured.minWidth || COLUMN_WIDTHS[column],
			minHeight: measured.minHeight || row.height,
			value: getCellValue(row, column),
		} satisfies SheetCellEditTarget;
	};

	const focusWrapIfNeeded = () => {
		const wrap = wrapRef.current;
		if (!wrap || document.activeElement === wrap) return;
		wrap.focus({ preventScroll: true });
	};

	/** text/memo는 input(IME), 그 외는 wrap */
	const focusSelectionTarget = (column: SheetColumnId = targetRef.current?.column ?? 'text') => {
		if (isTextColumn(column)) {
			const input = inputRef.current;
			if (!input || document.activeElement === input) return;
			input.focus({ preventScroll: true });
			return;
		}
		focusWrapIfNeeded();
	};

	/** 선택만, 편집 비활성(z-index -1) */
	const focusTarget = (rowIndex: number, column: SheetColumnId, cell: HTMLElement) => {
		const next = resolveTarget(rowIndex, column, cell) ?? resolveTargetByIndex(rowIndex, column);
		if (!next) return;

		modeRef.current = 'focus';
		setTarget(next);
		setMode('focus');
		requestAnimationFrame(() => focusSelectionTarget(column));
	};

	/**
	 * 포커스 적용.
	 * 하이라이트/좌표는 즉시 갱신하고, DOM 실측은 최신 이동만 1프레임 보정.
	 */
	const applyFocus = (
		rowIndex: number,
		column: SheetColumnId,
		options?: { scrollTop?: number | null },
	) => {
		if (!rowsRef.current[rowIndex] || !isEditableColumn(format, column)) return;

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

		const estimated = resolveTargetByIndex(rowIndex, column);
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
		requestAnimationFrame(() => focusSelectionTarget(column));

		if (refineRafRef.current != null) cancelAnimationFrame(refineRafRef.current);
		refineRafRef.current = requestAnimationFrame(() => {
			refineRafRef.current = null;
			if (focusSeq !== focusSeqRef.current) return;

			const cell = findCellElement(rowIndex, column);
			if (!cell) return;

			const measured = resolveTarget(rowIndex, column, cell);
			if (!measured || focusSeq !== focusSeqRef.current) return;
			setTarget(measured);
		});
	};

	const focusEditorInput = (selectAll: boolean) => {
		const input = inputRef.current;
		if (!input) return;
		input.focus({ preventScroll: true });
		const selection = window.getSelection();
		if (!selection) return;
		const range = document.createRange();
		range.selectNodeContents(input);
		if (!selectAll) range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	};

	/** React 리렌더 없이 편집 면 노출 — IME 조합 중 setMode 금지용 */
	const showEditingSurface = () => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		wrap.classList.add('on');
		wrap.style.opacity = '1';
		wrap.style.zIndex = '3';
		wrap.style.pointerEvents = 'auto';
	};

	const clearEditingSurfaceStyles = () => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		wrap.style.opacity = '';
		wrap.style.zIndex = '';
		wrap.style.pointerEvents = '';
	};

	/**
	 * 문자 키로 편집 시작.
	 * - text focus 시 input은 비어 있음(타입 투 리플레이스)
	 * - IME: innerHTML/selectAll/setMode 금지 → compositionend 후 setMode
	 * - 영문: DOM 유지, setMode만 microtask
	 */
	const activateEditFromTyping = (isIme: boolean) => {
		editBootstrapRef.current = { applied: true };
		modeRef.current = 'edit';
		showEditingSurface();

		if (isIme) {
			const input = inputRef.current;
			let didFlush = false;
			const flushMode = () => {
				if (didFlush) return;
				didFlush = true;
				clearEditingSurfaceStyles();
				if (modeRef.current === 'edit') setMode('edit');
			};
			// compositionend 전에 setMode 하면 ㅇ+ㅏ 조합이 끊김 — end에서만 동기화
			input?.addEventListener('compositionend', flushMode, { once: true });
			return;
		}

		queueMicrotask(() => {
			clearEditingSurfaceStyles();
			if (modeRef.current === 'edit') setMode('edit');
		});
	};

	/** 더블클릭/우클릭/Enter — 기존 값 로드 + 전체 선택 */
	const beginEdit = (rowIndex: number, column: SheetColumnId, cell?: HTMLElement | null) => {
		if (!isEditableColumn(format, column)) return;
		// context 편집은 text/memo만
		if (!isTextColumn(column)) return;

		const next =
			cell != null
				? resolveTarget(rowIndex, column, cell)
				: targetRef.current?.rowIndex === rowIndex && targetRef.current.column === column
					? targetRef.current
					: null;
		if (!next) return;

		editBootstrapRef.current = { applied: false };
		modeRef.current = 'edit';
		clearEditingSurfaceStyles();
		setTarget(next);
		setMode('edit');
	};

	const commitEdit = (keepFocus = false) => {
		const current = targetRef.current;
		if (!current || modeRef.current !== 'edit') {
			if (!keepFocus) {
				setMode('hidden');
				setTarget(null);
			}
			return;
		}

		const encoded = encodeCellHtml(inputRef.current);
		const nextValue =
			current.column === 'text' || current.column === 'memo'
				? encoded
				: (inputRef.current?.innerText ?? encoded).trim();

		if (nextValue !== current.value) {
			onCommitCell(current.rowIndex, current.column, nextValue);
		}

		if (keepFocus) {
			modeRef.current = 'focus';
			clearEditingSurfaceStyles();
			setMode('focus');
			requestAnimationFrame(() => focusSelectionTarget(current.column));
			return;
		}

		modeRef.current = 'hidden';
		clearEditingSurfaceStyles();
		setMode('hidden');
		setTarget(null);
	};

	/** ESC 취소 — 값은 되돌리고 셀 선택(focus)은 유지 */
	const cancelEdit = () => {
		if (modeRef.current !== 'edit') return;
		modeRef.current = 'focus';
		clearEditingSurfaceStyles();
		setMode('focus');
		requestAnimationFrame(() => focusSelectionTarget());
	};

	/** 기본 커밋. keepFocus는 이동 직전용 */
	const endEdit = (commit = true) => {
		if (modeRef.current !== 'edit') return;
		if (commit) {
			commitEdit(true);
			return;
		}
		modeRef.current = 'focus';
		clearEditingSurfaceStyles();
		setMode('focus');
		requestAnimationFrame(() => focusSelectionTarget());
	};

	const handleCellClick = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();

		if (modeRef.current === 'edit') {
			const current = targetRef.current;
			if (current && (current.rowIndex !== rowIndex || current.column !== column)) {
				commitEdit();
			} else if (current?.rowIndex === rowIndex && current.column === column) {
				return;
			}
		}

		if (!isEditableColumn(format, column)) {
			setMode('hidden');
			setTarget(null);
			return;
		}

		focusTarget(rowIndex, column, event.currentTarget);
	};

	const handleCellDoubleClick = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();
		beginEdit(rowIndex, column, event.currentTarget);
	};

	const handleCellContextMenu = (
		event: ReactMouseEvent<HTMLDivElement>,
		rowIndex: number,
		column: SheetColumnId,
	) => {
		event.preventDefault();
		event.stopPropagation();
		beginEdit(rowIndex, column, event.currentTarget);
	};

	/**
	 * 키 입력으로 편집 시작.
	 * IME 조합을 끊지 않도록 첫 키에서 innerHTML/selectAll/즉시 setMode 금지.
	 */
	const tryBeginEditFromKey = (event: {
		ctrlKey: boolean;
		altKey: boolean;
		metaKey: boolean;
		key: string;
		code: string;
		preventDefault?: () => void;
		isComposing?: boolean;
		nativeEvent?: { isComposing?: boolean; keyCode?: number };
		keyCode?: number;
	}) => {
		if (modeRef.current !== 'focus') return false;
		const current = targetRef.current;
		if (!current || !isTextColumn(current.column)) return false;
		if (!shouldBeginEditFromKey(event)) return false;

		// Enter: 기존 값 편집(전체 선택). 문자 키: 빈 input에 타입 투 리플레이스
		if (event.key === 'Enter') {
			event.preventDefault?.();
			beginEdit(current.rowIndex, current.column);
			return true;
		}

		activateEditFromTyping(isImeStartKey(event));
		return true;
	};

	const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (tryBeginEditFromKey(event)) return;

		if (modeRef.current !== 'edit') return;

		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
			return;
		}

		if (event.key === 'Enter' && !event.shiftKey) {
			if (isTextColumn(targetRef.current?.column ?? 'index')) {
				event.preventDefault();
				insertEditorLineBreak();
				return;
			}
			event.preventDefault();
			commitEdit();
		}
	};

	const handleInputClick = (event: ReactMouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (modeRef.current === 'edit') inputRef.current?.focus();
	};

	const handleEditorBlur = () => {
		if (modeRef.current !== 'edit') return;
		window.setTimeout(() => {
			if (modeRef.current !== 'edit') return;
			const active = document.activeElement;
			if (active === inputRef.current || active === wrapRef.current) return;
			if (wrapRef.current?.contains(active)) return;
			commitEdit();
		}, 0);
	};

	// text 선택 + 미편집 시 문자 입력 → 편집 시작
	useEffect(() => {
		if (mode !== 'focus') return;
		if (!target || !isTextColumn(target.column)) return;

		const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
			if (isEditableDomTarget(event.target)) return;
			tryBeginEditFromKey(event);
		};

		window.addEventListener('keydown', handleWindowKeyDown);
		return () => {
			window.removeEventListener('keydown', handleWindowKeyDown);
		};
	}, [mode, target]);

	useEffect(() => {
		if (!target || !inputRef.current) return;
		if (mode === 'hidden') return;

		const input = inputRef.current;

		// IME 진행 중: React mode는 아직 focus — 조합 중인 input을 덮어쓰지 않음
		if (mode === 'focus' && modeRef.current === 'edit') return;

		if (mode === 'edit') {
			const bootstrap = editBootstrapRef.current;
			if (!bootstrap || bootstrap.applied) return;
			bootstrap.applied = true;

			input.innerHTML = isTextColumn(target.column) ? `${target.value}<br>` : target.value;
			focusEditorInput(true);
			return;
		}

		// focus: text는 빈 버퍼(타입 투 리플레이스 + IME 조합), 값은 셀 하이라이트만 표시
		input.innerHTML = isTextColumn(target.column) ? '<br>' : target.value;
	}, [mode, target]);

	return {
		mode,
		target,
		inputRef,
		wrapRef,
		currentRowIndex: target?.rowIndex ?? null,
		currentColumn: target?.column ?? null,
		endEdit,
		applyFocus,
		handleCellClick,
		handleCellDoubleClick,
		handleCellContextMenu,
		handleInputKeyDown,
		handleInputClick,
		handleEditorBlur,
	};
};

export { useSheetCellEdit };
