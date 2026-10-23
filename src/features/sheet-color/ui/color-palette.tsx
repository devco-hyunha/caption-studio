import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import type { ColorPaletteProps } from '../types';

/** 팔레트 8셀 swatch — 8 panel + `.current` 강조. 클릭 시 스토어에 저장·셀 선택 */
const ColorPalette = ({ colors, activeIndex, onSelect }: ColorPaletteProps) => {
  const paletteAria = useT('color.paletteAria');
  const slot1 = useT('color.slot1');
  const slot2 = useT('color.slot2');
  const slot3 = useT('color.slot3');
  const slot4 = useT('color.slot4');
  const slot5 = useT('color.slot5');
  const slot6 = useT('color.slot6');
  const slot7 = useT('color.slot7');
  const slot8 = useT('color.slot8');
  const slotLabels = [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8];

  return (
    <ul role="listbox" aria-label={paletteAria} className="flex gap-2">
      {colors.map((hex, index) => (
        <li key={index}>
          <button
            type="button"
            aria-label={slotLabels[index]}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => onSelect(index)}
            style={{ '--color-slot': hex } as CSSProperties}
            className={cn(
              'block h-9 w-9 rounded border border-neutral-300 bg-[var(--color-slot)]',
              activeIndex === index ? 'ring-primary ring-2 ring-offset-1' : 'ring-0',
            )}
          />
        </li>
      ))}
    </ul>
  );
};

export { ColorPalette };
