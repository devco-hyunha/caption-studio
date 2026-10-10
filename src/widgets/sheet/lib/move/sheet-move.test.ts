import { describe, expect, it } from 'vitest';
import {
	getEditableColIndex,
	getRowTop,
	moveColNext,
	moveColPrev,
	movePageNext,
	movePagePrev,
	moveRowNext,
	moveRowPrev,
	scrollColIntoView,
	scrollRowIntoView,
} from './sheet-move';

const ROWS = [{ height: 40 }, { height: 40 }, { height: 40 }, { height: 40 }, { height: 40 }];

describe('sheet-move', () => {
	it('getRowTop accumulates heights before the row', () => {
		expect(getRowTop(ROWS, 0)).toBe(0);
		expect(getRowTop(ROWS, 2)).toBe(80);
	});

	it('getEditableColIndex maps column ids by format', () => {
		expect(getEditableColIndex('smi', 'text')).toBe(1);
		expect(getEditableColIndex('srt', 'endtime')).toBe(1);
		expect(getEditableColIndex('smi', 'endtime')).toBe(-1);
	});

	it('moveRowPrev / moveRowNext keep column and handle edges', () => {
		expect(moveRowPrev({ row: 0, col: 1 })).toBeNull();
		expect(moveRowPrev({ row: 2, col: 1 })).toEqual({ row: 1, col: 1 });
		expect(moveRowNext({ row: 1, col: 0 }, 4, false)).toEqual({ row: 2, col: 0 });
		expect(moveRowNext({ row: 4, col: 0 }, 4, false)).toBeNull();
		expect(moveRowNext({ row: 4, col: 0 }, 4, true)).toBe('append');
	});

	it('moveColPrev / moveColNext wrap across rows', () => {
		expect(moveColPrev('smi', { row: 1, col: 0 })).toEqual({ row: 0, col: 2 });
		expect(moveColNext('smi', { row: 0, col: 2 }, 4)).toEqual({ row: 1, col: 0 });
		expect(moveColNext('smi', { row: 4, col: 2 }, 4)).toBeNull();
	});

	it('movePagePrev jumps one viewport when focus is in view', () => {
		const result = movePagePrev(ROWS, 2, { viewTop: 40, viewHeight: 80 });
		expect(result).toEqual({ row: 0, scrollTop: 0 });
	});

	it('movePagePrev scrolls focus to top when out of view', () => {
		const result = movePagePrev(ROWS, 4, { viewTop: 0, viewHeight: 80 });
		expect(result).toEqual({ row: 4, scrollTop: 160 });
	});

	it('movePageNext jumps one viewport when focus is in view', () => {
		const result = movePageNext(ROWS, 0, { viewTop: 0, viewHeight: 80 });
		expect(result).toEqual({ row: 2, scrollTop: 40 });
	});

	it('scrollRowIntoView only adjusts when the row is outside the viewport', () => {
		expect(scrollRowIntoView(ROWS, 1, 0, 80)).toEqual({ scrollTop: null });
		expect(scrollRowIntoView(ROWS, 0, 20, 80)).toEqual({ scrollTop: 0 });
		expect(scrollRowIntoView(ROWS, 3, 0, 80)).toEqual({ scrollTop: 80 });
	});

	it('scrollColIntoView only adjusts when the column is outside the viewport', () => {
		expect(scrollColIntoView(100, 50, 0, 200)).toEqual({ scrollLeft: null });
		expect(scrollColIntoView(0, 50, 20, 200)).toEqual({ scrollLeft: 0 });
		expect(scrollColIntoView(180, 50, 0, 200)).toEqual({ scrollLeft: 30 });
	});

	it('scrollColIntoView keeps focus clear of sticky left inset', () => {
		// starttime(left=54)가 sticky index(54) 아래에 가려진 경우 → scrollLeft 0
		expect(scrollColIntoView(54, 108, 40, 200, 54)).toEqual({ scrollLeft: 0 });
		// sticky 열(index) 자체는 보정 없음
		expect(scrollColIntoView(0, 54, 100, 200, 54)).toEqual({ scrollLeft: null });
		// 뷰 안이면 유지
		expect(scrollColIntoView(54, 108, 0, 200, 54)).toEqual({ scrollLeft: null });
	});
});
