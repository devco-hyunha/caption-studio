import { beforeEach, describe, expect, it } from 'vitest';
import { cloneTimeline, useSheetStore, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { HistoryEntry, HistoryTimelinePatch } from '../types';
import { applyHistoryRedo, applyHistoryUndo, timelineSnapshotEquals } from './apply-history-entry';

const resetSheets = (timelines: SheetTimelineItem[]) => {
  useSheetStore.setState({
    active: 0,
    sheets: [
      {
        name: 'sheet1',
        timelines: timelines.map(cloneTimeline),
        smiName: '',
        smiLang: '',
        scroll: 0,
        current: {},
        selectedRows: [],
        multipleActive: false,
        multipleStart: null,
      },
    ],
  });
};

const activeTimelines = () => useSheetStore.getState().sheets[0].timelines;

describe('timelineSnapshotEquals', () => {
  it('동일 스냅샷이면 true', () => {
    expect(
      timelineSnapshotEquals(
        { start: 1, end: 2, text: 'a', memo: '' },
        { start: 1, end: 2, text: 'a', memo: '' },
      ),
    ).toBe(true);
  });

  it('다르면 false — undo update 가드용', () => {
    expect(
      timelineSnapshotEquals(
        { start: 1, end: 2, text: 'a', memo: '' },
        { start: 1, end: 2, text: 'b', memo: '' },
      ),
    ).toBe(false);
  });
});

describe('applyHistoryUndo / applyHistoryRedo — command 분기', () => {
  beforeEach(() => {
    resetSheets([
      { start: 0, end: 1000, text: 'A', memo: '' },
      { start: 1000, end: 2000, text: 'B', memo: '' },
    ]);
  });

  it('update undo는 after와 같을 때만 before로 복원한다', () => {
    const before: SheetTimelineItem = { start: 0, end: 1000, text: 'A', memo: '' };
    const after: SheetTimelineItem = { start: 0, end: 1000, text: 'X', memo: '' };
    const entry: HistoryEntry = {
      command: 'update',
      id: 0,
      before,
      after,
      current: { row: 0, col: 1 },
    };

    // after와 다르면 가드 실패 — 스택은 스토어에서 소비, 시트는 그대로
    expect(applyHistoryUndo(entry)).toBeNull();
    expect(activeTimelines()[0]?.text).toBe('A');

    useSheetStore.getState().patchActiveTimeline(0, after);
    expect(applyHistoryUndo(entry)).toEqual({ row: 0, col: 1 });
    expect(activeTimelines()[0]?.text).toBe('A');
  });

  it('insert undo는 삽입된 행을 remove하고 clamp된 행으로 포커스한다', () => {
    const after: SheetTimelineItem = { start: 2000, end: 3000, text: 'C', memo: '' };
    const entry: HistoryEntry = {
      command: 'insert',
      id: 2,
      before: null,
      after,
      current: { row: 1, col: 0 },
    };

    useSheetStore.getState().spliceTimelineAt(2, after);
    expect(activeTimelines()).toHaveLength(3);

    expect(applyHistoryUndo(entry)).toEqual({ row: 1, col: 0 });
    expect(activeTimelines()).toHaveLength(2);

    expect(applyHistoryRedo(entry)).toEqual({ row: 2, col: 0 });
    expect(activeTimelines()[2]?.text).toBe('C');
  });

  it('remove undo는 삭제된 행을 제자리에 삽입한다', () => {
    const before: SheetTimelineItem = { start: 0, end: 1000, text: 'A', memo: '' };
    const entry: HistoryEntry = {
      command: 'remove',
      id: 0,
      before,
      after: null,
      current: { row: 0, col: 0 },
    };

    useSheetStore.getState().removeTimelineAt(0);
    expect(activeTimelines()[0]?.text).toBe('B');

    expect(applyHistoryUndo(entry)).toEqual({ row: 0, col: 0 });
    expect(activeTimelines()[0]?.text).toBe('A');

    expect(applyHistoryRedo(entry)).toEqual({ row: 0, col: 0 });
    expect(activeTimelines()[0]?.text).toBe('B');
  });

  it('multi.* undo/redo는 patch 배열을 일괄 적용한다', () => {
    const before: HistoryTimelinePatch[] = [
      { index: 0, data: { start: 0, end: 1000, text: 'A', memo: '' } },
      { index: 1, data: { start: 1000, end: 2000, text: 'B', memo: '' } },
    ];
    const after: HistoryTimelinePatch[] = [
      { index: 0, data: { start: 0, end: 1000, text: '<b>A</b>', memo: '' } },
      { index: 1, data: { start: 1000, end: 2000, text: '<b>B</b>', memo: '' } },
    ];
    const entry: HistoryEntry = {
      command: 'multi.bold',
      id: null,
      before,
      after,
      current: { row: 1, col: 1 },
    };

    useSheetStore.getState().replaceTimelinePatches(after);
    expect(activeTimelines()[0]?.text).toBe('<b>A</b>');

    expect(applyHistoryUndo(entry)).toEqual({ row: 1, col: 1 });
    expect(activeTimelines()[0]?.text).toBe('A');

    expect(applyHistoryRedo(entry)).toEqual({ row: 1, col: 1 });
    expect(activeTimelines()[1]?.text).toBe('<b>B</b>');
  });

  it('M1: multi undo 전 patch 행이 after와 다르면 적용하지 않는다 (null)', () => {
    const before: HistoryTimelinePatch[] = [
      { index: 0, data: { start: 0, end: 1000, text: 'A', memo: '' } },
      { index: 1, data: { start: 1000, end: 2000, text: 'B', memo: '' } },
    ];
    const after: HistoryTimelinePatch[] = [
      { index: 0, data: { start: 0, end: 1000, text: '<b>A</b>', memo: '' } },
      { index: 1, data: { start: 1000, end: 2000, text: '<b>B</b>', memo: '' } },
    ];
    const entry: HistoryEntry = {
      command: 'multi.bold',
      id: null,
      before,
      after,
      current: { row: 1, col: 1 },
    };

    // multi 실행 후 행이 어긋난 상태 — patch[1]의 현재가 after와 다름
    useSheetStore.getState().replaceTimelinePatches([after[0]]);
    expect(applyHistoryUndo(entry)).toBeNull();
    expect(activeTimelines()[1]?.text).toBe('B');
  });

  it('M5: multipleActive 중 insert undo는 스택·데이터가 함께 이동 (removeTimelineAt 게이트 무시)', () => {
    const after: SheetTimelineItem = { start: 2000, end: 3000, text: 'C', memo: '' };
    const entry: HistoryEntry = {
      command: 'insert',
      id: 2,
      before: null,
      after,
      current: { row: 1, col: 0 },
    };

    useSheetStore.getState().spliceTimelineAt(2, after);
    useSheetStore.setState((state) => ({
      sheets: [
        { ...state.sheets[0], multipleActive: true, selectedRows: [0, 1], multipleStart: 0 },
      ],
    }));

    // 다중 선택 중이어도 undo 전용 제거 경로로 행이 제거된다
    expect(applyHistoryUndo(entry)).toEqual({ row: 1, col: 0 });
    expect(activeTimelines()).toHaveLength(2);
  });

  it('M2: undo(spliceActiveTimelineAt)는 다중 선택을 클리어하지 않는다', () => {
    const before: SheetTimelineItem = { start: 0, end: 1000, text: 'A', memo: '' };
    const entry: HistoryEntry = {
      command: 'remove',
      id: 0,
      before,
      after: null,
      current: { row: 0, col: 0 },
    };

    useSheetStore.getState().removeTimelineAt(0);
    useSheetStore.setState((state) => ({
      sheets: [{ ...state.sheets[0], multipleActive: true, selectedRows: [0], multipleStart: 0 }],
    }));

    expect(applyHistoryUndo(entry)).toEqual({ row: 0, col: 0 });
    const sheet = useSheetStore.getState().sheets[0];
    expect(sheet.timelines[0]?.text).toBe('A');
    expect(sheet.selectedRows).toEqual([0]);
    expect(sheet.multipleStart).toBe(0);
  });
});
