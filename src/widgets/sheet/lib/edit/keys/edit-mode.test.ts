import { describe, expect, it } from 'vitest';
import type {
  SheetCellEditTarget,
  SheetCellEditorMode,
  SheetEditKeyProbe,
  EditModeDeps,
} from '../../../types';

import {
  hasFocusMode,
  isEditingMode,
  isTextTargetMode,
  isTimeTargetMode,
  resolveEditKeyIntent,
} from './edit-mode';

const base: SheetEditKeyProbe = {
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  key: '',
  code: '',
};

const modeDeps = (mode: SheetCellEditorMode, target: SheetCellEditTarget | null): EditModeDeps => ({
  modeRef: { current: mode },
  targetRef: { current: target },
});

const textTarget: SheetCellEditTarget = {
  rowIndex: 1,
  column: 'text',
  left: 0,
  top: 0,
  minWidth: 10,
  minHeight: 10,
  value: 'B',
};

describe('edit-mode', () => {
  it('predicates read mode/target refs', () => {
    const focus = modeDeps('focus', textTarget);
    expect(isEditingMode(focus.modeRef)).toBe(false);
    expect(isTextTargetMode(focus.targetRef)).toBe(true);
    expect(hasFocusMode(focus.modeRef, focus.targetRef)).toBe(true);

    const hidden = modeDeps('hidden', textTarget);
    expect(hasFocusMode(hidden.modeRef, hidden.targetRef)).toBe(false);
    expect(isTextTargetMode(modeDeps('focus', null).targetRef)).toBe(false);
    expect(
      isTextTargetMode(modeDeps('focus', { ...textTarget, column: 'starttime' }).targetRef),
    ).toBe(false);
  });

  it('isTimeTargetMode: starttime/endtime만 true, text·null은 false', () => {
    const focus = modeDeps('focus', textTarget);
    expect(
      isTimeTargetMode(modeDeps('focus', { ...textTarget, column: 'starttime' }).targetRef),
    ).toBe(true);
    expect(
      isTimeTargetMode(modeDeps('focus', { ...textTarget, column: 'endtime' }).targetRef),
    ).toBe(true);
    expect(isTimeTargetMode(focus.targetRef)).toBe(false);
    expect(isTimeTargetMode(modeDeps('focus', null).targetRef)).toBe(false);
  });

  it('resolveEditKeyIntent: Enter → enter, printable/IME → typing, others null', () => {
    const focus = modeDeps('focus', textTarget);
    expect(resolveEditKeyIntent(focus, { ...base, key: 'Enter', code: 'Enter' })).toBe('enter');
    expect(resolveEditKeyIntent(focus, { ...base, key: 'a', code: 'KeyA' })).toBe('typing');
    expect(resolveEditKeyIntent(focus, { ...base, key: 'Process' })).toBe('typing');
    expect(resolveEditKeyIntent(focus, { ...base, key: ' ', code: 'Space' })).toBe('typing');
    expect(
      resolveEditKeyIntent(focus, { ...base, ctrlKey: true, key: 'a', code: 'KeyA' }),
    ).toBeNull();
    expect(resolveEditKeyIntent(focus, { ...base, key: 'ArrowRight' })).toBeNull();
  });

  it('resolveEditKeyIntent: non-focus mode and non-text target are null', () => {
    expect(
      resolveEditKeyIntent(modeDeps('edit', textTarget), { ...base, key: 'a', code: 'KeyA' }),
    ).toBeNull();
    expect(
      resolveEditKeyIntent(modeDeps('hidden', textTarget), { ...base, key: 'Enter' }),
    ).toBeNull();
    expect(
      resolveEditKeyIntent(modeDeps('focus', { ...textTarget, column: 'starttime' }), {
        ...base,
        key: 'a',
        code: 'KeyA',
      }),
    ).toBeNull();
  });
});
