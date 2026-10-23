import { describe, expect, it } from 'vitest';
import {
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
} from './color-math';

describe('color-math — hex·rgb·hsb 변환', () => {
  it('hexToRgb — 6 hex를 bit 시프트로 분해', () => {
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('rgbToHex — 각 채널을 2자 hex로 pad·소문자', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('ff0000');
    expect(rgbToHex({ r: 10, g: 11, b: 12 })).toBe('0a0b0c');
  });

  it('순색 HSB — 빨강(0,100,100)·초록(120,100,100)·파랑(240,100,100)', () => {
    expect(rgbToHsb({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, b: 100 });
    expect(rgbToHsb({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, b: 100 });
    expect(rgbToHsb({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, b: 100 });
  });

  it('무채색 — 흰(255)·검(0)은 s=0, r=g=b', () => {
    expect(rgbToHsb({ r: 255, g: 255, b: 255 })).toMatchObject({ s: 0, b: 100 });
    expect(rgbToHsb({ r: 0, g: 0, b: 0 })).toMatchObject({ s: 0, b: 0 });
    expect(hsbToRgb({ h: 0, s: 0, b: 100 })).toEqual({ r: 255, g: 255, b: 255 });
    expect(hsbToRgb({ h: 0, s: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('hex↔rgb↔hsb 왕복 — 기본 팔레트 전 셀이 자기 hex로 돌아온다', () => {
    const palette = [
      '#ff0000',
      '#ff00ff',
      '#aa00ff',
      '#0000ff',
      '#00ffff',
      '#00ff00',
      '#ffff00',
      '#ffaa00',
    ];
    for (const hex of palette) {
      const hsb = hexToHsb(hex);
      expect('#' + hsbToHex(hsb)).toBe(hex);
    }
  });

  it('경계 clamp — 상한 360/100/255를 넘기면 상한, 음수는 0', () => {
    expect(fixHsb({ h: 400, s: -10, b: 130 })).toEqual({ h: 360, s: 0, b: 100 });
    expect(fixRgb({ r: 300, g: -5, b: 128 })).toEqual({ r: 255, g: 0, b: 128 });
  });

  it('fixHex — 6자리 미만은 좌측 0 pad', () => {
    expect(fixHex('ff')).toBe('0000ff');
    expect(fixHex('ff0000')).toBe('ff0000');
  });

  it('parseHexColor — 6 hex만 허용, `#`는 strip·pad. invalid는 null', () => {
    expect(parseHexColor('#ff0000')).toEqual({ h: 0, s: 100, b: 100 });
    expect(parseHexColor('abc')).toBeNull();
    expect(parseHexColor('ff00zz')).toBeNull();
  });
});
