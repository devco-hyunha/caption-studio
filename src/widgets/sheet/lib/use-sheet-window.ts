import { useEffect, useRef, useState } from 'react';
import type { SheetWindowResult, UseSheetWindowParams } from '../types';
import {
	getRenderRange,
	isSameRenderRange,
} from './sheet-render-range';

/**
 * page 스냅 시트 윈도.
 * - page = viewport 높이 단위
 * - page 변경 시에만 윈도 commit
 * - 탭별 scrollTop 복원 (restoreKey 변경 시)
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

	const [sheetWindow, setSheetWindow] = useState<SheetWindowResult>(() =>
		getRenderRange(rows, restoreScrollTop, 0),
	);

	useEffect(() => {
		rowsRef.current = rows;
	});

	useEffect(() => {
		onScrollTopChangeRef.current = onScrollTopChange;
	});

	const commitWindow = (scrollTop: number, viewportHeight: number) => {
		const next = getRenderRange(rowsRef.current, scrollTop, viewportHeight);
		const prev = windowRef.current;
		if (prev && isSameRenderRange(prev, next)) return;

		windowRef.current = next;
		setSheetWindow(next);
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

	useEffect(() => {
		commitWindow(scrollTopRef.current, viewportHeightRef.current);
	}, [rows]);

	// 탭 전환 후 body.scrollTop = savedScroll
	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		const nextScroll = Math.max(0, restoreScrollTop);
		element.scrollTop = nextScroll;
		scrollTopRef.current = nextScroll;
		onScrollTopChangeRef.current?.(nextScroll);
		commitWindow(nextScroll, viewportHeightRef.current || element.clientHeight);
	}, [restoreKey, restoreScrollTop]);

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
