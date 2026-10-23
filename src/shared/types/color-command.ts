/** color 적용 커맨드 공유 정본 — shortkey(키·action)·sheet-color(store·실행)이 all-direct 소비 */

/** color0..7 slot index — 팔레트 인덱스 */
export type ColorSlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** color 적용 command 정본명: color0..color7 · color_clear */
export type SheetColorCommand = `color${ColorSlotIndex}` | 'color_clear';
