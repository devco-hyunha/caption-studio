import { describe, expect, it } from 'vitest';
import type { FocusBodyMetrics, SheetRowView } from '../../../types';
import { computeFocusScroll } from './apply-focus';

const ROWS: SheetRowView[] = [
  {
    index: 0,
    starttime: '00:00:00.000',
    endtime: '00:00:01.000',
    dur: '00:00:01.000',
    text: 'A',
    memo: '',
    height: 40,
  },
  {
    index: 1,
    starttime: '00:00:01.000',
    endtime: '00:00:02.000',
    dur: '00:00:02.000',
    text: 'B',
    memo: '',
    height: 30,
  },
  {
    index: 2,
    starttime: '00:00:02.000',
    endtime: '00:00:03.000',
    dur: '00:00:01.000',
    text: 'C',
    memo: '',
    height: 40,
  },
];

const metrics = (
  scrollTop: number,
  scrollLeft: number,
  clientHeight: number,
  clientWidth: number,
): FocusBodyMetrics => ({
  scrollTop,
  scrollLeft,
  clientHeight,
  clientWidth,
});

describe('computeFocusScroll', () => {
  it('row below view → rowScroll aligns bottom; visible column needs no scrollLeft', () => {
    const result = computeFocusScroll(ROWS, 'smi', 2, 'index', metrics(0, 0, 50, 200));
    expect(result?.target.rowIndex).toBe(2);
    // focusTop 70, focusBottom 110, view 0~50 → 110 - 50
    expect(result?.rowScroll).toBe(60);
    // sticky index 열 안쪽 → 가로 보정 없음
    expect(result?.scrollLeft).toBeNull();
  });

  it('column right of view → scrollLeft aligns right edge', () => {
    const result = computeFocusScroll(ROWS, 'smi', 2, 'text', metrics(70, 0, 50, 200));
    // text left = 54+108+73 = 235, width 361 → right 596, view 0~200
    expect(result?.scrollLeft).toBe(596 - 200);
  });

  it('out-of-range row → null', () => {
    expect(computeFocusScroll(ROWS, 'smi', 9, 'text', metrics(0, 0, 50, 200))).toBeNull();
  });

  it('row above view → rowScroll aligns top', () => {
    const result = computeFocusScroll(ROWS, 'smi', 0, 'text', metrics(100, 0, 50, 200));
    expect(result?.rowScroll).toBe(0);
  });
});
