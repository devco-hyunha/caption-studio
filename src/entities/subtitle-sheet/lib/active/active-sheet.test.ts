import { describe, expect, it } from 'vitest';
import type { SheetsState } from '../../types';
import {
  replaceTimelineAt,
  replaceTimelinePatches,
  removeActiveTimelineAt,
  setActiveTimelines,
  updateActiveSelectedTexts,
} from './active-sheet';

const state = (overrides: Partial<SheetsState> = {}): SheetsState => ({
  active: 0,
  sheets: [
    {
      name: 'sheet1',
      timelines: [{ text: 'a' }, { text: 'b' }, { text: 'c' }],
      smiName: '',
      smiLang: '',
      scroll: 0,
      current: {},
      selectedRows: [0, 2],
      multipleActive: true,
      multipleStart: 0,
    },
  ],
  ...overrides,
});

describe('updateActiveSelectedTexts', () => {
  it('선택 행 text에만 transform 적용', () => {
    const next = updateActiveSelectedTexts(state(), (text) => `<b>${text}</b>`);
    expect(next?.sheets[0].timelines.map((t) => t.text)).toEqual(['<b>a</b>', 'b', '<b>c</b>']);
  });

  it('multiple이 아니면 null', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    expect(updateActiveSelectedTexts(off, (text) => `<b>${text}</b>`)).toBeNull();
  });

  it('선택 행이 없으면 null', () => {
    const empty = state({
      sheets: [{ ...state().sheets[0], selectedRows: [] }],
    });
    expect(updateActiveSelectedTexts(empty, (text) => `<b>${text}</b>`)).toBeNull();
  });

  it('변화가 없으면 null (transform이 같은 값)', () => {
    expect(updateActiveSelectedTexts(state(), (text) => text)).toBeNull();
  });

  it('활성 탭만 patch', () => {
    const two = state({
      active: 1,
      sheets: [
        state().sheets[0],
        {
          ...state().sheets[0],
          name: 'sheet2',
          timelines: [{ text: 'x' }, { text: 'y' }],
          selectedRows: [1],
        },
      ],
    });
    const next = updateActiveSelectedTexts(two, (text) => `<i>${text}</i>`);
    expect(next?.sheets[0].timelines.map((t) => t.text)).toEqual(['a', 'b', 'c']);
    expect(next?.sheets[1].timelines.map((t) => t.text)).toEqual(['x', '<i>y</i>']);
  });
});

describe('replaceTimelineAt', () => {
  it('행 타임라인을 ms 값으로 직접 patch', () => {
    const next = replaceTimelineAt(state(), 1, { start: 130, end: 230, text: 'b' });
    expect(next?.sheets[0].timelines[1]).toEqual({ start: 130, end: 230, text: 'b' });
    expect(next?.sheets[0].timelines[0]).toEqual({ text: 'a' });
  });

  it('행이 없으면 null', () => {
    expect(replaceTimelineAt(state(), 9, { start: 0, end: 0 })).toBeNull();
  });

  it('patchActiveSelectedRows와 달리 multiple이 아니어도 patch', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    const next = replaceTimelineAt(off, 0, { start: 50, end: 60, text: 'a' });
    expect(next?.sheets[0].timelines[0]).toEqual({ start: 50, end: 60, text: 'a' });
  });
});

describe('replaceTimelinePatches', () => {
  it('선택 행 타임라인만 일괄 patch', () => {
    const patches = new Map([
      [0, { start: 10, end: 20, text: 'a' }],
      [2, { start: 30, end: 40, text: 'c' }],
    ]);
    const next = replaceTimelinePatches(state(), patches);
    expect(next?.sheets[0].timelines).toEqual([
      { start: 10, end: 20, text: 'a' },
      { text: 'b' },
      { start: 30, end: 40, text: 'c' },
    ]);
  });

  it('multiple이 아니면 null', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    expect(replaceTimelinePatches(off, new Map([[0, { start: 10 }]]))).toBeNull();
  });

  it('선택·patch 없으면 null', () => {
    const empty = state({
      sheets: [{ ...state().sheets[0], selectedRows: [] }],
    });
    expect(replaceTimelinePatches(empty, new Map([[0, { start: 10 }]]))).toBeNull();
    expect(replaceTimelinePatches(state(), new Map())).toBeNull();
  });

  it('활성 탭만 patch', () => {
    const two = state({
      active: 1,
      sheets: [
        state().sheets[0],
        {
          ...state().sheets[0],
          name: 'sheet2',
          timelines: [
            { start: 1, text: 'x' },
            { start: 2, text: 'y' },
          ],
          selectedRows: [1],
        },
      ],
    });
    const next = replaceTimelinePatches(two, new Map([[1, { start: 99, text: 'y' }]]));
    expect(next?.sheets[0].timelines[0]).toEqual({ text: 'a' });
    expect(next?.sheets[1].timelines[1]).toEqual({ start: 99, text: 'y' });
  });
});

describe('removeActiveTimelineAt (clearSelection param)', () => {
  it('normal(true): multiple 중이면 null', () => {
    expect(removeActiveTimelineAt(state(), 1, true)).toBeNull();
  });

  it('normal(true): multiple이 아니면 행 삭제 + 선택 초기화', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    const next = removeActiveTimelineAt(off, 1, true);
    expect(next?.state.sheets[0].timelines.map((t) => t.text)).toEqual(['a', 'c']);
    expect(next?.state.sheets[0].selectedRows).toEqual([]);
    expect(next?.state.sheets[0].multipleStart).toBeNull();
  });

  it('history(false): multiple 중에도 삭제, 선택 유지 (M5)', () => {
    const next = removeActiveTimelineAt(state(), 1, false);
    expect(next?.state.sheets[0].timelines.map((t) => t.text)).toEqual(['a', 'c']);
    expect(next?.state.sheets[0].selectedRows).toEqual([0, 2]);
    expect(next?.state.sheets[0].multipleActive).toBe(true);
    expect(next?.state.sheets[0].multipleStart).toBe(0);
  });

  it('focusRow clamp — 마지막 행 삭제 시 직전 행', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    const last = removeActiveTimelineAt(off, 2, true);
    expect(last?.focusRow).toBe(1);
  });

  it('행 범위 밖이면 null', () => {
    const off = state({
      sheets: [{ ...state().sheets[0], multipleActive: false }],
    });
    expect(removeActiveTimelineAt(off, 9, true)).toBeNull();
    expect(removeActiveTimelineAt(off, 9, false)).toBeNull();
  });
});

describe('setActiveTimelines', () => {
  it('활성 탭 timelines를 복사로 교체하고 스크롤·선택·포커스를 초기화한다', () => {
    const next = setActiveTimelines(state(), [{ start: 10, end: 20, text: 'new', memo: 'm' }]);
    const sheet = next?.sheets[0];

    expect(sheet?.timelines).toEqual([{ start: 10, end: 20, text: 'new', memo: 'm' }]);
    expect(sheet?.scroll).toBe(0);
    expect(sheet?.selectedRows).toEqual([]);
    expect(sheet?.multipleActive).toBe(false);
    expect(sheet?.multipleStart).toBeNull();
    expect(sheet?.current).toEqual({});
  });

  it('빈 배열은 빈 행 1개', () => {
    const next = setActiveTimelines(state(), []);
    expect(next?.sheets[0].timelines).toEqual([{ start: 0, end: 0, text: '', memo: '' }]);
  });

  it('활성 탭만 교체하고 타 탭은 유지', () => {
    const two = state({
      active: 1,
      sheets: [
        state().sheets[0],
        { ...state().sheets[0], name: 'sheet2', timelines: [{ text: 'keep' }] },
      ],
    });
    const next = setActiveTimelines(two, [{ start: 1, text: 'new' }]);

    expect(next?.sheets[0].timelines.map((t) => t.text)).toEqual(['a', 'b', 'c']);
    expect(next?.sheets[1].timelines).toEqual([{ start: 1, text: 'new' }]);
  });

  it('입력 배열을 mutate하지 않는다 (clone)', () => {
    const input = [{ start: 1, text: 'x' }];
    const next = setActiveTimelines(state(), input);

    expect(next?.sheets[0].timelines[0]).not.toBe(input[0]);
    expect(input).toEqual([{ start: 1, text: 'x' }]);
  });
});
