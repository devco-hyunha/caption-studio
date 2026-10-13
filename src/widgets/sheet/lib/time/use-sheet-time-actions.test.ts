import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSheetStore } from '@/entities/subtitle-sheet';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { registerVideoPlayerControlApi } from '@/features/video-sync';
import { useSheetTimeActions } from './use-sheet-time-actions';

const resetStore = () => {
  useSheetStore.setState({
    active: 0,
    sheets: [
      {
        name: 'sheet1',
        timelines: [
          { start: 1000, end: 2000, text: 'A', memo: '' },
          { start: 3000, end: 4000, text: 'B', memo: '' },
        ],
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

const renderTime = (overrides: Partial<Parameters<typeof useSheetTimeActions>[0]> = {}) => {
  resetStore();
  const closeSearchPanel = vi.fn();
  const isTimeTarget = vi.fn(() => true);
  const isEditing = vi.fn(() => false);
  const onUpdateCell = vi.fn(() => true);
  const hook = renderHook(
    (props: Parameters<typeof useSheetTimeActions>[0]) => useSheetTimeActions(props),
    {
      initialProps: {
        format: 'smi' as const,
        currentRowIndex: 1,
        currentColumn: 'starttime' as const,
        isTimeTarget,
        isEditing,
        closeSearchPanel,
        onUpdateCell,
        ...overrides,
      },
    },
  );
  return { hook, closeSearchPanel, isEditing, onUpdateCell };
};

describe('useSheetTimeActions closeSearchPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  it('timePlus — mutate 직전 closeSearchPanel 호출', () => {
    const { hook, closeSearchPanel } = renderTime();

    act(() => hook.result.current.timePlus());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
  });

  it('timeMinus — mutate 직전 closeSearchPanel 호출', () => {
    const { hook, closeSearchPanel } = renderTime();

    act(() => hook.result.current.timeMinus());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
  });

  it('time 타깃 아니어도 closeSearchPanel은 호출 (mutate 직전 게이트)', () => {
    const { hook, closeSearchPanel } = renderTime({ isTimeTarget: () => false });

    act(() => hook.result.current.timePlus());
    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
  });

  it('단건 timePlus push shape — command update·before/after 스냅샷·current col', () => {
    useSheetHistoryStore.getState().resetForSheets(1, 0);
    const { hook } = renderTime();

    act(() => hook.result.current.timePlus());
    const stack = useSheetHistoryStore.getState().stacks[0];
    const last = stack.entries[stack.index];
    expect(last?.command).toBe('update');
    expect(last?.id).toBe(1);
    expect(last?.before).toEqual({ start: 3000, end: 4000, text: 'B', memo: '' });
    expect(last?.after).toEqual({ start: 3030, end: 4000, text: 'B', memo: '' });
    expect(last?.current).toEqual({ row: 1, col: 0 });
  });

  it('다중 선택 timePlus push shape — multi.plus·backups/currents', () => {
    useSheetHistoryStore.getState().resetForSheets(1, 0);
    const { hook } = renderTime();
    useSheetStore.setState((state) => ({
      sheets: [
        {
          ...state.sheets[0],
          multipleActive: true,
          selectedRows: [0, 1],
          multipleStart: 0,
        },
      ],
    }));

    act(() => hook.result.current.timePlus());
    const stack = useSheetHistoryStore.getState().stacks[0];
    const last = stack.entries[stack.index];
    expect(last?.command).toBe('multi.plus');
    expect(last?.id).toBeNull();
    expect((last?.before as { index: number }[]).map((p) => p.index)).toEqual([0, 1]);
    expect((last?.after as { index: number }[]).map((p) => p.index)).toEqual([0, 1]);
  });
});

describe('useSheetTimeActions timeCarve', () => {
  beforeEach(() => {
    resetStore();
    registerVideoPlayerControlApi(null);
  });

  it('플레이어 시각을 포커스 time 셀에 timecode로 커밋', () => {
    registerVideoPlayerControlApi({
      seekTo: () => true,
      getCurrentTime: () => 1.5,
      toggle: () => {},
      setVolume: () => {},
      getVolume: () => 0,
    });
    const { hook, closeSearchPanel, onUpdateCell } = renderTime();

    act(() => hook.result.current.timeCarve());

    expect(closeSearchPanel).toHaveBeenCalledTimes(1);
    expect(onUpdateCell).toHaveBeenCalledWith(1, 'starttime', '00:00:01,500');
  });

  it('에딧 중·time 타깃 아니면 커밋하지 않는다', () => {
    registerVideoPlayerControlApi({
      seekTo: () => true,
      getCurrentTime: () => 1.5,
      toggle: () => {},
      setVolume: () => {},
      getVolume: () => 0,
    });
    const { hook, onUpdateCell } = renderTime({ isEditing: () => true });
    act(() => hook.result.current.timeCarve());
    expect(onUpdateCell).not.toHaveBeenCalled();

    const notTime = renderTime({ isTimeTarget: () => false });
    act(() => notTime.hook.result.current.timeCarve());
    expect(notTime.onUpdateCell).not.toHaveBeenCalled();
  });

  it('플레이어 미등록이면 커밋하지 않는다', () => {
    const { hook, onUpdateCell } = renderTime();

    act(() => hook.result.current.timeCarve());
    expect(onUpdateCell).not.toHaveBeenCalled();
  });
});
