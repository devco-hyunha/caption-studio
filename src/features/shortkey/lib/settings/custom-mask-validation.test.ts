import { describe, expect, it } from 'vitest';
import { validateCustomMask } from './custom-mask-validation';
import { SHORTKEY_IDS } from '../../model/keys/ids';
import { DEFAULT_SHEET_SHORTKEY_MASKS } from '../../model/keys/masks';

const masks = { ...DEFAULT_SHEET_SHORTKEY_MASKS };

describe('validateCustomMask', () => {
  it('empty raw mask — empty', () => {
    expect(validateCustomMask({ rawMask: '  ', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe('empty');
  });

  it('single char — single', () => {
    expect(validateCustomMask({ rawMask: 'k', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe('single');
  });

  it('conflict with other id mask — conflict', () => {
    expect(validateCustomMask({ rawMask: 'ctrl+z', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe(
      'conflict',
    );
  });

  it('conflict via comma member of dual mask — conflict', () => {
    expect(validateCustomMask({ rawMask: 'meta+q', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe(
      'conflict',
    );
  });

  it('self id comma member is not conflict', () => {
    expect(validateCustomMask({ rawMask: 'meta+?', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe(
      'ok',
    );
  });

  it('free mask passes all checks — ok', () => {
    expect(validateCustomMask({ rawMask: 'Ctrl + K', masks, selfId: SHORTKEY_IDS.SEARCH })).toBe(
      'ok',
    );
  });
});
