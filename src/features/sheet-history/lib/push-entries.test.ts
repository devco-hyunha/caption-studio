import { describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { HistoryTimelinePatch } from '../types';
import { buildCurrents, buildMultiEntry, buildUpdateEntry } from './push-entries';

const timeline = (text: string): SheetTimelineItem => ({ text });

describe('buildUpdateEntry', () => {
  it('before/after를 clone하고 command·id·current를 담는다', () => {
    const before = timeline('a');
    const after = timeline('b');
    const entry = buildUpdateEntry(2, before, after, { row: 2, col: 1 });

    expect(entry.command).toBe('update');
    expect(entry.id).toBe(2);
    expect(entry.before).toEqual(before);
    expect(entry.after).toEqual(after);
    expect(entry.current).toEqual({ row: 2, col: 1 });
    // clone — 원본과 동일 객체가 아니다
    expect(entry.before).not.toBe(before);
    expect(entry.after).not.toBe(after);
  });
});

describe('buildCurrents', () => {
  it('backup 인덱스로 after timelines 스냅샷을 수집한다', () => {
    const backups: HistoryTimelinePatch[] = [
      { index: 0, data: timeline('a') },
      { index: 2, data: timeline('c') },
    ];
    const timelines = [timeline('a'), timeline('b'), timeline('c'), timeline('d')];

    const currents = buildCurrents(backups, timelines);
    expect(currents).toEqual([
      { index: 0, data: timeline('a') },
      { index: 2, data: timeline('c') },
    ]);
    expect(currents[0].data).not.toBe(timelines[0]);
  });

  it('인덱스가 timelines 범위를 벗어나면 해당 항목을 건너뛴다', () => {
    const backups: HistoryTimelinePatch[] = [
      { index: 0, data: timeline('a') },
      { index: 5, data: timeline('z') },
    ];
    const timelines = [timeline('a')];

    const currents = buildCurrents(backups, timelines);
    expect(currents).toEqual([{ index: 0, data: timeline('a') }]);
  });
});

describe('buildMultiEntry', () => {
  it('command·id(null)·before·after·current를 담는다', () => {
    const backups: HistoryTimelinePatch[] = [{ index: 0, data: timeline('a') }];
    const currents: HistoryTimelinePatch[] = [{ index: 0, data: timeline('b') }];

    const entry = buildMultiEntry('multi.bold', backups, currents, { row: 0, col: 0 });

    expect(entry.command).toBe('multi.bold');
    expect(entry.id).toBeNull();
    expect(entry.before).toBe(backups);
    expect(entry.after).toBe(currents);
    expect(entry.current).toEqual({ row: 0, col: 0 });
  });
});
