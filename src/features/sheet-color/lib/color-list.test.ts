import { describe, expect, it } from 'vitest';
import { DEFAULT_COLOR_LIST, mergeColorList } from './color-list';

describe('color-list — 기본 팔레트·레거시 승격', () => {
  it('기본 팔레트 — 초값 순서·8셀', () => {
    expect(DEFAULT_COLOR_LIST).toHaveLength(8);
    expect(DEFAULT_COLOR_LIST[0]).toBe('#ff0000');
    expect(DEFAULT_COLOR_LIST[7]).toBe('#ffaa00');
  });

  it('mergeColorList — 레거시 배열 유효 hex만 index 순으로 덮어씀', () => {
    const merged = mergeColorList(['#112233', '#445566']);
    expect(merged[0]).toBe('#112233');
    expect(merged[1]).toBe('#445566');
    expect(merged[2]).toBe('#aa00ff');
  });

  it('대문자 hex는 소문자 승격, invalid·범위 밖 index는 기본 유지', () => {
    const merged = mergeColorList([
      '#AABBCC',
      'not-hex',
      '#000000',
      '#000000',
      '#000000',
      '#000000',
      '#000000',
      '#000000',
      '#ffffff',
    ]);
    expect(merged[0]).toBe('#aabbcc');
    expect(merged[1]).toBe('#ff00ff');
    expect(merged[8]).toBeUndefined();
    expect(merged).toHaveLength(8);
  });

  it('비배열 입력은 기본 팔레트 그대로', () => {
    expect(mergeColorList(undefined)).toEqual(DEFAULT_COLOR_LIST);
    expect(mergeColorList('str')).toEqual(DEFAULT_COLOR_LIST);
    expect(mergeColorList({})).toEqual(DEFAULT_COLOR_LIST);
  });

  it('DEFAULT_COLOR_LIST를 오염시키지 않는다 (승격은 복사본)', () => {
    mergeColorList(['#000000']);
    expect(DEFAULT_COLOR_LIST[0]).toBe('#ff0000');
  });
});
