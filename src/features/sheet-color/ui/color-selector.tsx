import { useState } from 'react';
import { useT } from '@/shared/lib/i18n';
import { DialogShell } from '@/shared/ui/dialog-shell';
import { hsbToHex, hexToHsb } from '../lib/color-math';
import { useColorStore } from '../model/use-color-store';
import type { ColorSelectorProps, HsbColor } from '../types';
import { ColorPalette } from './color-palette';
import { ColorPicker } from './color-picker';

/**
 * color selector dialog — 팔레트 8셀 + 피커. 팔레트 셀 → picker setColor(list[index]),
 * submit → list[index]=#hex · store 반영.
 */
const ColorSelector = ({ open, onOpenChange, prevFocusRef }: ColorSelectorProps) => {
  const title = useT('color.select');
  const colors = useColorStore((state) => state.colors);
  const setColor = useColorStore((state) => state.setColor);

  // 열림 시 첫 slot active — 미선택 적용도 active slot에 저장
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [pickerValue, setPickerValue] = useState<HsbColor>(
    () => hexToHsb(colors[0]) ?? { h: 0, s: 0, b: 0 },
  );

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    const hsb = hexToHsb(colors[index]);
    if (hsb) setPickerValue(hsb);
  };

  const handleSubmit = (hsb: HsbColor) => {
    if (activeIndex == null) return;
    // 팔레트 정본은 `#` prefix hex → execCommand foreColor가 `#rrggbb` 수신
    setColor(activeIndex, `#${hsbToHex(hsb)}`);
  };

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} title={title} prevFocusRef={prevFocusRef}>
      <div className="flex flex-col gap-4">
        <ColorPalette colors={colors} activeIndex={activeIndex} onSelect={handleSelect} />
        <ColorPicker value={pickerValue} onValueChange={setPickerValue} onSubmit={handleSubmit} />
      </div>
    </DialogShell>
  );
};

export { ColorSelector };
