import type { ShortcutsApi } from '@/shared/types/shortkey';
import type { SheetColorCommand } from '@/shared/types/color-command';
import type { SheetShortkeyActions, SheetShortkeyId } from '../../types';
import { SHORTKEY_IDS, SHORTKEY_TYPES } from '../../model/keys/ids';
import { defineSheetKey, registerSheetKeys } from '../engine/shortkey-keys';

/** 커스텀 color 키 id */
const COLOR_KEY_IDS = [
  SHORTKEY_IDS.COLOR_0,
  SHORTKEY_IDS.COLOR_1,
  SHORTKEY_IDS.COLOR_2,
  SHORTKEY_IDS.COLOR_3,
  SHORTKEY_IDS.COLOR_4,
  SHORTKEY_IDS.COLOR_5,
  SHORTKEY_IDS.COLOR_6,
  SHORTKEY_IDS.COLOR_7,
  SHORTKEY_IDS.COLOR_CLEAR,
] as const satisfies readonly SheetShortkeyId[];

/** id → 커스텀 키 placeholder (`color-1..8`·`color-reset`) — 설정 UI는 labels 소비, 여기는 engine placeholder */
const COLOR_KEY_PLACEHOLDERS: Record<(typeof COLOR_KEY_IDS)[number], string> = {
  [SHORTKEY_IDS.COLOR_0]: 'color-1',
  [SHORTKEY_IDS.COLOR_1]: 'color-2',
  [SHORTKEY_IDS.COLOR_2]: 'color-3',
  [SHORTKEY_IDS.COLOR_3]: 'color-4',
  [SHORTKEY_IDS.COLOR_4]: 'color-5',
  [SHORTKEY_IDS.COLOR_5]: 'color-6',
  [SHORTKEY_IDS.COLOR_6]: 'color-7',
  [SHORTKEY_IDS.COLOR_7]: 'color-8',
  [SHORTKEY_IDS.COLOR_CLEAR]: 'color-reset',
};

/** color command 정본명 — color_clear만 id와 표기가 다르다 */
const toColorCommand = (id: SheetShortkeyId): SheetColorCommand =>
  id === SHORTKEY_IDS.COLOR_CLEAR ? 'color_clear' : (id as SheetColorCommand);

/**
 * color0~7(Ctrl+1..8)·colorClear(Ctrl+9) 커스텀 키 — 다중·에딧·단건 분기는 actions 훅에서 처리.
 * 진입점은 actions의 applyColor 소비.
 */
const registerSheetColorKeys = (
  shortcuts: ShortcutsApi,
  getActions: () => SheetShortkeyActions,
) => {
  registerSheetKeys(
    shortcuts,
    COLOR_KEY_IDS.map((id) =>
      defineSheetKey(
        id,
        () => {
          getActions().applyColor(toColorCommand(id));
        },
        {
          placeholder: COLOR_KEY_PLACEHOLDERS[id],
          type: SHORTKEY_TYPES.DOWN,
          preventDefault: true,
        },
      ),
    ),
  );
};

export { registerSheetColorKeys, toColorCommand };
