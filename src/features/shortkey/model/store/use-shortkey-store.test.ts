import { beforeEach, describe, expect, it } from 'vitest';
import { SHORTKEY_IDS } from '../keys/ids';
import { SHORTKEY_MASKS, DEFAULT_SHEET_SHORTKEY_MASKS } from '../keys/masks';
import { CUSTOM_SHORTKEY_IDS } from '../keys/custom-ids';
import { isCustomShortkeyId } from '../../lib/settings/custom-mask-validation';
import { STORAGE_KEY_SHORTKEY } from '../storage/constants';
import { useShortkeyStore } from './use-shortkey-store';

const readPersisted = () => {
  const raw = localStorage.getItem(STORAGE_KEY_SHORTKEY);
  return raw ? (JSON.parse(raw) as { state: { masks: Record<string, string> } }).state.masks : null;
};

describe('useShortkeyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useShortkeyStore.getState().resetMasks();
  });

  it('starts with default sheet shortkey masks', () => {
    expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_SHORTKEY_MASKS);
  });

  it('custom ctrl keys register dual ctrl+meta masks', () => {
    expect(DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.SHEET_INSERT]).toBe(
      'ctrl+shift+a,meta+shift+a',
    );
    expect(DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.SEARCH]).toBe('ctrl+?,meta+?');
    expect(DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.VOLUME_UP]).toBe('ctrl+up,meta+up');
  });

  it('fixed non-ctrl keys keep single mask', () => {
    expect(DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.NEXT_ROW_MOVE]).toBe('tab');
    expect(DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.SHEET_JUMP]).toBe('alt+q');
  });

  it('setMask updates custom id with normalized mask', () => {
    // UI 경로는 convertEventToMask가 만든 mask를 넘긴다 — Slash 토큰은 codeMap의 '?'
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.SEARCH, 'Ctrl + ?');
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.SEARCH]).toBe('ctrl+?');
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.SHEET_INSERT]).toBe(
      DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.SHEET_INSERT],
    );
  });

  it('setMask blocks fixed id (high fixed key cannot be rebound)', () => {
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.NEXT_ROW_MOVE, 'ctrl+tab');
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.FONT_BOLD, 'ctrl+k');
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.VOLUME_UP, 'ctrl+down');
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.NEXT_ROW_MOVE]).toBe(SHORTKEY_MASKS.TAB);
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.FONT_BOLD]).toBe(SHORTKEY_MASKS.CTRL_B);
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.VOLUME_UP]).toBe(
      DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.VOLUME_UP],
    );
    expect(readPersisted()).toEqual({});
  });

  it('isCustomShortkeyId covers the approved 22 ids and excludes fixed keys', () => {
    expect(CUSTOM_SHORTKEY_IDS).toHaveLength(22);
    expect(isCustomShortkeyId(SHORTKEY_IDS.SEARCH, CUSTOM_SHORTKEY_IDS)).toBe(true);
    expect(isCustomShortkeyId(SHORTKEY_IDS.CUE_NEXT, CUSTOM_SHORTKEY_IDS)).toBe(true);
    expect(isCustomShortkeyId(SHORTKEY_IDS.COLOR_0, CUSTOM_SHORTKEY_IDS)).toBe(true);
    expect(isCustomShortkeyId(SHORTKEY_IDS.COLOR_CLEAR, CUSTOM_SHORTKEY_IDS)).toBe(true);
    expect(isCustomShortkeyId(SHORTKEY_IDS.VOLUME_UP, CUSTOM_SHORTKEY_IDS)).toBe(false);
    expect(isCustomShortkeyId(SHORTKEY_IDS.SHEET_EDIT_ON, CUSTOM_SHORTKEY_IDS)).toBe(false);
  });

  it('persists only changed masks', () => {
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.SHEET_INSERT, 'Ctrl + Shift + K');
    expect(readPersisted()).toEqual({ [SHORTKEY_IDS.SHEET_INSERT]: 'ctrl+shift+k' });
  });

  it('promotes legacy customkey-* storage on merge', () => {
    localStorage.setItem('customkey-sheet-insert', JSON.stringify('ctrl+shift+k'));
    useShortkeyStore.persist.rehydrate();
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.SHEET_INSERT]).toBe('ctrl+shift+k');
  });

  it('promotes legacy customkey-plus/minus on merge', () => {
    localStorage.setItem('customkey-plus', JSON.stringify('ctrl+shift+u'));
    useShortkeyStore.persist.rehydrate();
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.TIME_PLUS]).toBe('ctrl+shift+u');
  });

  it('legacy promotion is one-shot — key removed, no resurrection after reset', () => {
    localStorage.setItem('customkey-sheet-insert', JSON.stringify('ctrl+shift+k'));
    useShortkeyStore.persist.rehydrate();
    expect(localStorage.getItem('customkey-sheet-insert')).toBeNull();
    useShortkeyStore.getState().resetMasks();
    useShortkeyStore.persist.rehydrate();
    expect(useShortkeyStore.getState().masks[SHORTKEY_IDS.SHEET_INSERT]).toBe(
      DEFAULT_SHEET_SHORTKEY_MASKS[SHORTKEY_IDS.SHEET_INSERT],
    );
  });

  it('resetMasks restores defaults and clears persisted changes', () => {
    useShortkeyStore.getState().setMask(SHORTKEY_IDS.SHEET_REMOVE, 'ctrl+shift+x');
    useShortkeyStore.getState().resetMasks();
    expect(useShortkeyStore.getState().masks).toEqual(DEFAULT_SHEET_SHORTKEY_MASKS);
    expect(readPersisted()).toEqual({});
  });
});
