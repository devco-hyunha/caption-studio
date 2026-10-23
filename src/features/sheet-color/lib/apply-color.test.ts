import { beforeEach, describe, expect, it } from 'vitest';
import { useColorStore } from '../model/use-color-store';
import { parseColorSlot, toExecArgs } from './apply-color';

describe('apply-color — color0..7 slot·exec 인자 파싱', () => {
  beforeEach(() => {
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

  it('parseColorSlot — color0..color7는 index, colorClear는 null', () => {
    expect(parseColorSlot('color0')).toBe(0);
    expect(parseColorSlot('color7')).toBe(7);
    expect(parseColorSlot('color_clear')).toBeNull();
  });

  it('toExecArgs — color0..7는 foreColor + 팔레트 hex, colorClear는 removeFormat', () => {
    expect(toExecArgs('color0', 0)).toEqual({ attr: 'foreColor', value: '#ff0000' });
    expect(toExecArgs('color7', 7)).toEqual({ attr: 'foreColor', value: '#ffaa00' });
    expect(toExecArgs('color_clear', null)).toEqual({ attr: 'removeFormat', value: 'foreColor' });
  });

  it('toExecArgs — slot null(colorClear 외)은 value null', () => {
    expect(toExecArgs('color0', null)).toEqual({ attr: 'foreColor', value: null });
  });
});
