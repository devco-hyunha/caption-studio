import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetShortkeyActions } from '../../types';
import { SHORTKEY_IDS, SHORTKEY_TYPES } from '../../model/keys/ids';
import { SHORTKEY_PLACEHOLDERS } from '../../model/keys/labels';
import { defineSheetKey, registerSheetKeys } from '../engine/shortkey-keys';

/**
 * video 재생·seek 키 (Ctrl+Space · Ctrl+←/→ · Ctrl+↑/↓ · Ctrl+Q · Alt+Q).
 * 키보드 진입은 shortkey — video widget 전용 keydown 없음.
 * 다중 선택 분기는 actions 훅에서 처리.
 */
const registerSheetVideoKeys = (
  shortcuts: ShortcutsApi,
  getActions: () => SheetShortkeyActions,
) => {
  registerSheetKeys(shortcuts, [
    defineSheetKey(
      SHORTKEY_IDS.VIDEO_JUMP,
      () => {
        const actions = getActions();
        if (actions.isMultiple()) return;
        actions.videoJump();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_JUMP,
        type: SHORTKEY_TYPES.DOWN,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.SHEET_JUMP,
      () => {
        const actions = getActions();
        if (actions.isMultiple()) return;
        actions.sheetJump();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.SHEET_JUMP,
        type: SHORTKEY_TYPES.DOWN,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.VIDEO_PLAY,
      () => {
        const actions = getActions();
        if (actions.isMultiple()) return;
        actions.videoPlayToggle();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_PLAY,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.VIDEO_SEEK_PREV,
      () => {
        getActions().videoSeekPrev();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_SEEK_PREV,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.VIDEO_SEEK_NEXT,
      () => {
        getActions().videoSeekNext();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VIDEO_SEEK_NEXT,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.VOLUME_UP,
      () => {
        getActions().volumeUp();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VOLUME_UP,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.VOLUME_DOWN,
      () => {
        getActions().volumeDown();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.VOLUME_DOWN,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.CUE_PREV,
      () => {
        getActions().cuePrev();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.CUE_PREV,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
    defineSheetKey(
      SHORTKEY_IDS.CUE_NEXT,
      () => {
        getActions().cueNext();
      },
      {
        placeholder: SHORTKEY_PLACEHOLDERS.CUE_NEXT,
        type: SHORTKEY_TYPES.HOLD,
        preventDefault: true,
      },
    ),
  ]);
};

export { registerSheetVideoKeys };
