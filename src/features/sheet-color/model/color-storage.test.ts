import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY_COLOR, loadColors } from './color-storage';

describe('color-storage — CaptionColorTemp 승격·영속 read', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('없으면 기본 팔레트', () => {
    expect(loadColors()).toHaveLength(8);
    expect(loadColors()[0]).toBe('#ff0000');
  });

  it('레거시 배열 JSON은 index 순으로 승격 (CaptionColorTemp)', () => {
    window.localStorage.setItem(STORAGE_KEY_COLOR, JSON.stringify(['#000000', '#111111']));
    const loaded = loadColors();
    expect(loaded[0]).toBe('#000000');
    expect(loaded[1]).toBe('#111111');
    expect(loaded[2]).toBe('#aa00ff');
    expect(loaded).toHaveLength(8);
  });

  it('persist 래퍼 `{state:{colors}}`는 colors를 승격', () => {
    window.localStorage.setItem(
      STORAGE_KEY_COLOR,
      JSON.stringify({
        state: {
          colors: [
            '#123456',
            '#654321',
            '#aabbcc',
            '#ccbbaa',
            '#00ff00',
            '#ff00ff',
            '#0000ff',
            '#ff0000',
          ],
        },
        version: 0,
      }),
    );
    const loaded = loadColors();
    expect(loaded[0]).toBe('#123456');
    expect(loaded[7]).toBe('#ff0000');
  });

  it('corrupt payload는 기본 팔레트로 폴백', () => {
    window.localStorage.setItem(STORAGE_KEY_COLOR, 'not json');
    expect(loadColors()[0]).toBe('#ff0000');
  });

  it('STORAGE_KEY_COLOR는 레거시 키 CaptionColorTemp', () => {
    expect(STORAGE_KEY_COLOR).toBe('CaptionColorTemp');
  });
});
