import type { ColorList } from '../types';

/** 기본 팔레트 8 hex — 팔레트 초값 순서 */
const DEFAULT_COLOR_LIST: ColorList = [
  '#ff0000',
  '#ff00ff',
  '#aa00ff',
  '#0000ff',
  '#00ffff',
  '#00ff00',
  '#ffff00',
  '#ffaa00',
];

/** 레거시 `CaptionColorTemp` 승격 — 유효 hex만 index 순으로 덮어씀 */
const mergeColorList = (legacy: unknown): ColorList => {
  const list = [...DEFAULT_COLOR_LIST];
  if (!Array.isArray(legacy)) return list;
  legacy.forEach((color, index) => {
    if (index >= list.length) return;
    if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) {
      list[index] = color.toLowerCase();
    }
  });
  return list;
};

export { DEFAULT_COLOR_LIST, mergeColorList };
