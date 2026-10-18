import type { CodeMap, MaskObject, ShortcutParams, ShortcutType } from '@/shared/types/shortkey';
import { resolveTokenCodes } from './code-map';
import { MODIFIER_CODES, MODIFIER_TOKENS, isModifierToken } from './modifiers';

const normalizeMask = (mask: string) => String(mask).toLowerCase().replace(/\s+/g, '');

const getMaskObject = (mask: string, codeMap: CodeMap): MaskObject => {
  const obj: MaskObject = {};
  mask.split('+').forEach((item) => {
    if (isModifierToken(item)) {
      obj[item] = true;
      return;
    }
    obj.code = resolveTokenCodes(item, codeMap);
  });
  return obj;
};

const getKey = (type: ShortcutType | string, maskObj: MaskObject) => {
  const key = [type, ...MODIFIER_TOKENS.filter((token) => maskObj[token])].join('_');

  const keyMaker = (base: string, code?: string) => {
    if (code && !MODIFIER_CODES.has(code)) return `${base}_${code}`;
    return base;
  };

  if (Array.isArray(maskObj.code)) {
    return maskObj.code.map((code) => keyMaker(key, code));
  }
  return keyMaker(key, maskObj.code);
};

/** params의 mask·list → (listName, key) 전수 순회 */
const forEachMaskKey = (
  params: Pick<ShortcutParams, 'mask' | 'type' | 'list'>,
  codeMap: CodeMap,
  iterate: (listName: string, key: string) => void,
) => {
  const type = params.type || 'down';
  const listNames = params.list ? normalizeMask(params.list).split(',') : ['default'];
  const masks = normalizeMask(params.mask).split(',');

  listNames.forEach((listName) => {
    masks.forEach((mask) => {
      const maskObj = getMaskObject(mask, codeMap);
      let keys = getKey(type, maskObj);
      if (!Array.isArray(keys)) keys = [keys];
      keys.forEach((key) => iterate(listName, key));
    });
  });
};

export { forEachMaskKey, getKey, getMaskObject, normalizeMask };
