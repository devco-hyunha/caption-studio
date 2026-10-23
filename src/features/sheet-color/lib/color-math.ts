import type { HsbColor, RgbColor } from '../types';

/** hex(6) → RGB (bit 시프트) */
const hexToRgb = (hex: string): RgbColor => {
  const value = parseInt(hex.includes('#') ? hex.slice(1) : hex, 16);
  return {
    r: value >> 16,
    g: (65280 & value) >> 8,
    b: 255 & value,
  };
};

/** RGB → HSB (max=b, s=(255·delta)/max, h는 max 채널 기준) */
const rgbToHsb = (rgb: RgbColor): HsbColor => {
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  const b = max;
  const s = max !== 0 ? (255 * delta) / max : 0;
  let h: number;
  if (s !== 0) {
    if (rgb.r === max) h = (rgb.g - rgb.b) / delta;
    else if (rgb.g === max) h = 2 + (rgb.b - rgb.r) / delta;
    else h = 4 + (rgb.r - rgb.g) / delta;
  } else {
    h = -1;
  }
  h *= 60;
  if (rgb.r === rgb.g && rgb.g === rgb.b) h = 360;
  else if (h < 0) h += 360;
  return { h, s: (s * 100) / 255, b: (b * 100) / 255 };
};

/** HSB → RGB (t1/t2/t3 sector 분해, h=360→0) */
const hsbToRgb = (hsb: HsbColor): RgbColor => {
  let h = Math.round(hsb.h);
  const s = Math.round((255 * hsb.s) / 100);
  const v = Math.round((255 * hsb.b) / 100);
  if (s === 0) {
    return { r: v, g: v, b: v };
  }
  const t1 = v;
  const t2 = ((255 - s) * v) / 255;
  const t3 = ((t1 - t2) * (h % 60)) / 60;
  if (h === 360) h = 0;
  const rgb =
    h < 60
      ? { r: t1, b: t2, g: t2 + t3 }
      : h < 120
        ? { g: t1, b: t2, r: t1 - t3 }
        : h < 180
          ? { g: t1, r: t2, b: t2 + t3 }
          : h < 240
            ? { b: t1, r: t2, g: t1 - t3 }
            : h < 300
              ? { b: t1, g: t2, r: t2 + t3 }
              : h < 360
                ? { r: t1, g: t2, b: t1 - t3 }
                : { r: 0, g: 0, b: 0 };
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
};

/** HSB/RGB의 h/s/b·r/g/b clamp (상한 각각 360/100/255) */
const fixHsb = (hsb: HsbColor): HsbColor => ({
  h: Math.min(360, Math.max(0, hsb.h)),
  s: Math.min(100, Math.max(0, hsb.s)),
  b: Math.min(100, Math.max(0, hsb.b)),
});

const fixRgb = (rgb: RgbColor): RgbColor => ({
  r: Math.min(255, Math.max(0, rgb.r)),
  g: Math.min(255, Math.max(0, rgb.g)),
  b: Math.min(255, Math.max(0, rgb.b)),
});

/** hex 6자리 pad */
const fixHex = (hex: string): string => hex.padStart(6, '0');

/** RGB → hex (`rrggbb` 소문자, 접두사 없음) */
const rgbToHex = (rgb: RgbColor): string =>
  [rgb.r, rgb.g, rgb.b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');

const hexToHsb = (hex: string): HsbColor => rgbToHsb(hexToRgb(hex));
const hsbToHex = (hsb: HsbColor): string => rgbToHex(hsbToRgb(hsb));

/** hex 문자열 → HSB. `#`여부·6자리 pad 허용. 6 hex가 아니면 null */
const parseHexColor = (hex: string): HsbColor | null => {
  const body = hex.includes('#') ? hex.slice(1) : hex;
  if (!/^[0-9a-f]{6}$/i.test(body)) return null;
  return hexToHsb(fixHex(body));
};

export {
  fixHex,
  fixHsb,
  fixRgb,
  hexToHsb,
  hexToRgb,
  hsbToHex,
  hsbToRgb,
  parseHexColor,
  rgbToHex,
  rgbToHsb,
};
