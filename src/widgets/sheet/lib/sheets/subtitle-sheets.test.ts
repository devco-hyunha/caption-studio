import { describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { mapTimelinesToRows } from './subtitle-sheets';

const timelines = (rows: SheetTimelineItem[]): SheetTimelineItem[] => rows;

describe('mapTimelinesToRows — SMI dur', () => {
  it('SMI dur는 다음 행 start − 현재 start (storedEnd 무시)', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 5000, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
        { start: 2000, end: 0, text: 'C' },
      ]),
      'smi',
    );
    expect(rows[0].dur).toBe('1.000');
    expect(rows[1].dur).toBe('1.000');
  });

  it('SMI 마지막 행 dur는 빈값', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 0, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
      ]),
      'smi',
    );
    expect(rows[1].dur).toBe('');
  });

  it('행 start 변경 시 이전 행 dur가 다음 start를 반영', () => {
    const base = [
      { start: 0, end: 0, text: 'A' },
      { start: 1000, end: 0, text: 'B' },
      { start: 2000, end: 0, text: 'C' },
    ];
    const before = mapTimelinesToRows(timelines(base), 'smi');
    expect(before[0].dur).toBe('1.000');

    const after = mapTimelinesToRows(
      timelines(base.map((r, i) => (i === 1 ? { ...r, start: 2000 } : r))),
      'smi',
    );
    expect(after[0].dur).toBe('2.000');
    expect(after[1].dur).toBe('0.000');
  });
});

describe('mapTimelinesToRows — SRT dur', () => {
  it('SRT dur는 storedEnd − start (다음 start 아님)', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 1500, text: 'A' },
        { start: 1000, end: 2000, text: 'B' },
      ]),
      'srt',
    );
    expect(rows[0].dur).toBe('1.500');
    expect(rows[1].dur).toBe('1.000');
  });

  it('SRT는 storedEnd가 finite(0 포함)면 storedEnd 우선', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 0, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
      ]),
      'srt',
    );
    expect(rows[0].dur).toBe('0.000');
  });
});

describe('mapTimelinesToRows — isError', () => {
  it('SMI: start > nextStart면 error (dur 음수)', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 2000, end: 0, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
      ]),
      'smi',
    );
    expect(rows[0].isError).toBe(true);
  });

  it('SMI: 정상 순서는 error 아님, 마지막 행은 error 아님', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 0, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
      ]),
      'smi',
    );
    expect(rows[0].isError).toBe(false);
    expect(rows[1].isError).toBe(false);
  });

  it('SMI: start == nextStart는 error 아님', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 1000, end: 0, text: 'A' },
        { start: 1000, end: 0, text: 'B' },
      ]),
      'smi',
    );
    expect(rows[0].isError).toBe(false);
  });

  it('SRT: end > nextStart면 error (다음 start 초과)', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 2000, text: 'A' },
        { start: 1000, end: 2000, text: 'B' },
      ]),
      'srt',
    );
    expect(rows[0].isError).toBe(true);
  });

  it('SRT: end < start면 error', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 2000, end: 1000, text: 'A' },
        { start: 3000, end: 4000, text: 'B' },
      ]),
      'srt',
    );
    expect(rows[0].isError).toBe(true);
  });

  it('SRT: 정상 순서는 error 아님', () => {
    const rows = mapTimelinesToRows(
      timelines([
        { start: 0, end: 1000, text: 'A' },
        { start: 1000, end: 2000, text: 'B' },
      ]),
      'srt',
    );
    expect(rows[0].isError).toBe(false);
  });
});
