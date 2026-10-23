import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY_COLOR } from './color-storage';
import { useColorStore } from './use-color-store';

describe('useColorStore — 팔레트 setColor·persist partialize', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useColorStore.setState({
      colors: [
        '#ff0000',
        '#ff00ff',
        '#aa00ff',
        '#0000ff',
        '#00ffff',
        '#00ff00',
        '#ffff00',
        '#ffaa00',
      ],
    });
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('setColor — 지정 index 셀만 교체, 나머지 유지', () => {
    useColorStore.getState().setColor(3, '#123456');
    const colors = useColorStore.getState().colors;
    expect(colors[3]).toBe('#123456');
    expect(colors[0]).toBe('#ff0000');
    expect(colors).toHaveLength(8);
  });

  it('범위 밖 index는 무변경 (0·7만 유효)', () => {
    useColorStore.getState().setColor(-1, '#000000');
    useColorStore.getState().setColor(8, '#000000');
    expect(useColorStore.getState().colors[0]).toBe('#ff0000');
    expect(useColorStore.getState().colors[7]).toBe('#ffaa00');
  });

  it('persist partialize — localStorage에 colors 필드만 저장 (setColor 후 flush)', () => {
    useColorStore.getState().setColor(0, '#abcdef');
    const raw = window.localStorage.getItem(STORAGE_KEY_COLOR);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as { state: { colors: string[] } };
    expect(parsed.state.colors[0]).toBe('#abcdef');
    expect(parsed.state).not.toHaveProperty('setColor');
  });
});
