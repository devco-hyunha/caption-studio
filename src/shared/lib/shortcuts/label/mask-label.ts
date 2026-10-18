/** mask 표시 라벨 변환 — 커스텀 키는 주 modifier 하나만 표시 */

import type { ModifierToken } from '@/shared/types/shortkey';
import type { NavigatorLite } from '@/shared/types/user-agent-data';
import { MODIFIER_LABELS } from '../engine/modifiers';

/** 부팅 1회 플랫폼 감지 — Mac이면 meta 우선, 그 외 ctrl 우선. userAgentData는 webview 위조 platform을 통과하므로 우선, UA 문자열 fallback */
const isMac = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator as NavigatorLite).userAgentData?.platform;
  if (platform) return /Mac|iPhone|iPad|iPod/i.test(platform);
  return /Macintosh|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/** comma mask → 플랫폼 주 modifier mask 선택 (ctrl+*와 meta+* 병행 등록에서 하나) */
const pickPrimaryMask = (mask: string, mac: boolean): string => {
  const masks = mask.split(',');
  if (masks.length < 2) return masks[0];
  const preferred = mac ? 'meta' : 'ctrl';
  const match = masks.find((item) => item.startsWith(`${preferred}+`));
  return match ?? masks[0];
};

/** mask → kbd 라벨 — modifier는 기호·`+`는 공백 분리 */
const maskToLabel = (mask: string): string =>
  mask
    .split('+')
    .map((token) => MODIFIER_LABELS[token as ModifierToken] ?? token)
    .join(' + ');

/** platform 감지 kbd 라벨 — 주 modifier 선택 후 라벨화 (행 렌더 시 isMac 판별) */
const maskToPrimaryLabel = (mask: string): string => maskToLabel(pickPrimaryMask(mask, isMac()));

export { isMac, maskToLabel, maskToPrimaryLabel, pickPrimaryMask };
