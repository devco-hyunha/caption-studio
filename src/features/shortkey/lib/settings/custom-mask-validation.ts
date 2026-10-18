import type { SheetShortkeyId } from '../../types';
import type { CustomMaskCheck, CustomMaskValidation } from '../../types';
import { normalizeMask } from '@/shared/lib/shortcuts';

/**
 * submit 검증 — 순서대로 empty · single · conflict. 모두 통과하면 ok.
 * conflict는 스토어 masks 전수 comma 분리 비교 (자기 id 제외).
 */
const validateCustomMask = ({ rawMask, masks, selfId }: CustomMaskCheck): CustomMaskValidation => {
  const mask = normalizeMask(rawMask);
  if (mask === '') return 'empty';
  if (mask.length === 1) return 'single';

  const needle = mask.split(',');
  const conflict = Object.entries(masks).some(
    ([id, existing]) =>
      id !== selfId &&
      existing
        .split(',')
        .some((item) => needle.some((n) => normalizeMask(n) === normalizeMask(item))),
  );

  return conflict ? 'conflict' : 'ok';
};

/** 커스텀 id 여부 — setMask·toSaveMasks·UI 게이트 */
const isCustomShortkeyId = (id: SheetShortkeyId, customIds: readonly SheetShortkeyId[]): boolean =>
  customIds.includes(id);

export { validateCustomMask, isCustomShortkeyId };
