import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SheetWindowResult, UseSheetWindowParams } from '../types';
import {
	getRenderRange,
	isSameRenderRange,
} from './sheet-render-range';

/**
 * page 스냅 시트 윈도.
 * - page = viewport 높이 단위
 * - page 변경 시에만 윈도 commit
 * - 탭별 scrollTop 복원: totalHeight 커밋 다음 layout에서 scrollTop 적용
 */
const useSheetWindow = ({
	rows,
	restoreScrollTop = 0,
	restoreKey = 0,
	onScrollTopChange,
}: UseSheetWindowParams) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const windowRef = useRef<SheetWindowResult | null>(null);
	const scrollTopRef = useRef(restoreScrollTop);
	const viewportHeightRef = useRef(0);
	const rafRef = useRef<number | null>(null);
	const rowsRef = useRef(rows);
	const onScrollTopChangeRef = useRef(onScrollTopChange);
	const prevRestoreKeyRef = useRef(restoreKey);
	/** 탭 복원 목표 scrollTop — totalHeight 반영 후 layout에서 적용 */
	const pendingRestoreRef = useRef<number | null>(null);
	/** pending을 건 직후 같은 layout 패스에서는 DOM이 옛 높이일 수 있어 1회 스킵 */
	const skipRestoreApplyRef = useRef(false);

	const [sheetWindow, setSheetWindow] = useState<SheetWindowResult>(() =>
		getRenderRange(rows, restoreScrollTop, 0),
	);

	useEffect(() => {
		onScrollTopChangeRef.current = onScrollTopChange;
	});

	const commitWindow = (scrollTop: number, viewportHeight: number) => {
		const next = getRenderRange(rowsRef.current, scrollTop, viewportHeight);
		const prev = windowRef.current;
		if (prev && isSameRenderRange(prev, next)) return false;

		windowRef.current = next;
		setSheetWindow(next);
		return true;
	};

	const applyRestoredScroll = (element: HTMLElement, nextScroll: number) => {
		element.scrollTop = nextScroll;
		const applied = element.scrollTop;
		scrollTopRef.current = applied;
		onScrollTopChangeRef.current?.(applied);
		if (applied !== nextScroll) {
			commitWindow(applied, element.clientHeight);
		}
	};

	const scheduleCommit = () => {
		if (rafRef.current != null) return;

		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null;
			commitWindow(scrollTopRef.current, viewportHeightRef.current);
		});
	};

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		viewportHeightRef.current = element.clientHeight;
		scrollTopRef.current = element.scrollTop;
		commitWindow(scrollTopRef.current, viewportHeightRef.current);

		const resizeObserver = new ResizeObserver(() => {
			viewportHeightRef.current = element.clientHeight;
			scheduleCommit();
		});
		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
			if (rafRef.current != null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only setup
	}, []);

	/**
	 * rows 변경 · 탭 전환 시 윈도 커밋.
	 * 탭 복원은 pending만 걸고, scrollTop 적용은 totalHeight 갱신 후 layout에서 한다.
	 */
	useLayoutEffect(() => {
		rowsRef.current = rows;
		const element = scrollRef.current;
		if (element) viewportHeightRef.current = element.clientHeight;

		const isTabRestore = prevRestoreKeyRef.current !== restoreKey;
		prevRestoreKeyRef.current = restoreKey;

		if (!isTabRestore) {
			commitWindow(scrollTopRef.current, viewportHeightRef.current);
			return;
		}

		const nextScroll = Math.max(0, restoreScrollTop);
		scrollTopRef.current = nextScroll;
		const didUpdate = commitWindow(nextScroll, viewportHeightRef.current);

		if (!element) {
			onScrollTopChangeRef.current?.(nextScroll);
			return;
		}

		if (didUpdate) {
			pendingRestoreRef.current = nextScroll;
			skipRestoreApplyRef.current = true;
			return;
		}

		// 윈도 범위가 같아 setState가 없으면 바로 적용 (이미 높이 확보된 경우)
		applyRestoredScroll(element, nextScroll);
	}, [rows, restoreKey, restoreScrollTop]);

	/** pending 복원 — sheetWindow(totalHeight)가 반영된 다음 layout에서 scrollTop 설정 */
	useLayoutEffect(() => {
		const pending = pendingRestoreRef.current;
		if (pending == null) return;

		if (skipRestoreApplyRef.current) {
			skipRestoreApplyRef.current = false;
			return;
		}

		const element = scrollRef.current;
		if (!element) return;

		pendingRestoreRef.current = null;
		applyRestoredScroll(element, pending);
	}, [sheetWindow, restoreKey]);

	const handleScroll = () => {
		const element = scrollRef.current;
		if (!element) return;

		scrollTopRef.current = element.scrollTop;
		onScrollTopChangeRef.current?.(element.scrollTop);
		scheduleCommit();
	};

	/** 프로그래밍 스크롤 (키보드 이동 / page) — scroll 이벤트 없이 윈도 동기화 */
	const setScrollTop = (nextScrollTop: number) => {
		const element = scrollRef.current;
		const next = Math.max(0, nextScrollTop);
		scrollTopRef.current = next;
		if (element) {
			element.scrollTop = next;
			viewportHeightRef.current = element.clientHeight;
		}
		onScrollTopChangeRef.current?.(next);
		commitWindow(next, viewportHeightRef.current);
	};

	return {
		scrollRef,
		sheetWindow,
		handleScroll,
		setScrollTop,
	};
};

export { useSheetWindow };
