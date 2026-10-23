import type { SheetColorCommand } from '@/shared/types/color-command';
import { useColorStore } from '../model/use-color-store';
import type { ColorExecArgs } from '../types';

/** color0..color7 slot 파싱 — color_clear는 null */
const parseColorSlot = (command: SheetColorCommand): number | null => {
  if (command === 'color_clear') return null;
  const index = Number.parseInt(command.slice(5), 10);
  return Number.isInteger(index) && index >= 0 && index < 8 ? index : null;
};

/** color_clear → `removeFormat`(value=foreColor 무시), color0..7 → `foreColor` + 팔레트 hex */
const toExecArgs = (command: SheetColorCommand, slot: number | null): ColorExecArgs => {
  if (command === 'color_clear') return { attr: 'removeFormat', value: 'foreColor' };
  const hex = slot == null ? null : (useColorStore.getState().colors[slot] ?? null);
  return { attr: 'foreColor', value: hex };
};

export { parseColorSlot, toExecArgs };
