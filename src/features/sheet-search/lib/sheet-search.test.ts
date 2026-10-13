import { describe, expect, it } from 'vitest';
import { canSearchNext, canSearchPrev, findSearchHits, stepSearchIndex } from './sheet-search';

describe('findSearchHits', () => {
  const timelines = [
    { text: 'Hello World', memo: '' },
    { text: 'other', memo: 'hello memo' },
    { text: 'HELLO', memo: 'x' },
  ];

  it('소문자 query로 text/memo를 찾고 format별 editable col을 넣는다', () => {
    expect(findSearchHits(timelines, 'hello', 'smi')).toEqual([
      { row: 0, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
    ]);
    expect(findSearchHits(timelines, 'hello', 'srt')).toEqual([
      { row: 0, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 2 },
    ]);
  });

  it('빈 query면 hits가 없다', () => {
    expect(findSearchHits(timelines, '', 'smi')).toEqual([]);
  });

  it('text·memo가 없는 행은 매치하지 않는다', () => {
    expect(findSearchHits([{}], 'hello', 'srt')).toEqual([]);
  });
});

describe('stepSearchIndex', () => {
  it('next/prev 경계를 클램프한다', () => {
    expect(stepSearchIndex(0, 3, 'next')).toBe(1);
    expect(stepSearchIndex(2, 3, 'next')).toBe(2);
    expect(stepSearchIndex(1, 3, 'prev')).toBe(0);
    expect(stepSearchIndex(0, 3, 'prev')).toBe(0);
    expect(stepSearchIndex(0, 0, 'next')).toBe(-1);
  });

  it('hits 없으면 -1', () => {
    expect(stepSearchIndex(-1, 0, 'next')).toBe(-1);
  });
});

describe('canSearchPrev / canSearchNext', () => {
  it('경계에서 prev/next 불가능', () => {
    expect(canSearchPrev(0, 3)).toBe(false);
    expect(canSearchPrev(1, 3)).toBe(true);
    expect(canSearchNext(2, 3)).toBe(false);
    expect(canSearchNext(1, 3)).toBe(true);
  });

  it('hits 없으면 둘 다 false', () => {
    expect(canSearchPrev(0, 0)).toBe(false);
    expect(canSearchNext(0, 0)).toBe(false);
  });
});
