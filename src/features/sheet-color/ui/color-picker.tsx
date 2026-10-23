import { useState } from 'react';
import { HsvColorPicker } from 'react-colorful';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ColorPickerProps, HsbColor } from '../types';
import { fixHsb, fixRgb, hsbToHex, hsbToRgb, hexToHsb, rgbToHsb } from '../lib/color-math';

/**
 * color 피커의 React 구현 — react-colorful `HsvColorPicker`가 sat×value 2D + hue strip.
 * HSV의 v가 HSB의 b(max 채색)와 동일 기하. 필드(hex/rgb/hsb)는 HSB 정본에서 파생.
 */
const ColorPicker = ({ value, onValueChange, onSubmit }: ColorPickerProps) => {
  const applyLabel = useT('color.apply');
  const hexLabel = useT('color.hexLabel');
  const channelAria = useT('color.channelAria');

  const rgb = hsbToRgb(value);
  const [hexDraft, setHexDraft] = useState(hsbToHex(value));

  // knob을 hex와 같은 양자 위치에 렌더 → hex 블러 시 knob 점프(흔들림) 방지
  const quantize = (next: HsbColor): HsbColor => hexToHsb(hsbToHex(next));

  const apply = (next: HsbColor): void => {
    const stable = quantize(next);
    setHexDraft(hsbToHex(stable));
    onValueChange(stable);
  };

  const commitHex = (raw: string): void => {
    const hsb = hexToHsb(raw.replace(/^#/, ''));
    if (hsb) apply(hsb);
  };

  // submit 직 hex draft를 commit — hex 입력 후 blur 없이 적용해도 draft 색이 반영
  const submit = (): void => {
    const committed = hexToHsb(hexDraft.replace(/^#/, '')) ?? value;
    apply(committed);
    onSubmit(committed);
  };

  const setChannel = (kind: 'rgb' | 'hsb', field: string, raw: string): void => {
    const num = Math.max(0, Number.parseInt(raw, 10) || 0);
    const next =
      kind === 'rgb'
        ? rgbToHsb(fixRgb({ ...rgb, [field]: num }))
        : fixHsb({ ...value, [field]: Math.min(field === 'h' ? 360 : 100, num) });
    apply(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <HsvColorPicker
        className="h-48 w-full"
        color={{ h: value.h, s: value.s, v: value.b }}
        onChange={(hsv) => apply({ h: hsv.h, s: hsv.s, b: hsv.v })}
      />

      <div className="grid grid-cols-4 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs">HEX</span>
          <Input
            aria-label={hexLabel}
            maxLength={6}
            value={hexDraft}
            onChange={(event) => setHexDraft(event.target.value)}
            onBlur={() => commitHex(hexDraft)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitHex(hexDraft);
            }}
          />
        </label>
        {(['r', 'g', 'b'] as const).map((field) => (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-xs uppercase">{field}</span>
            <Input
              aria-label={`${field.toUpperCase()} ${channelAria}`}
              maxLength={3}
              value={rgb[field]}
              onChange={(event) => setChannel('rgb', field, event.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['h', 's', 'b'] as const).map((field) => (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-xs uppercase">HSB {field}</span>
            <Input
              aria-label={`${field.toUpperCase()} ${channelAria}`}
              maxLength={3}
              value={Math.round(value[field])}
              onChange={(event) => setChannel('hsb', field, event.target.value)}
            />
          </label>
        ))}
      </div>

      <Button type="button" onClick={submit}>
        {applyLabel}
      </Button>
    </div>
  );
};

export { ColorPicker };
