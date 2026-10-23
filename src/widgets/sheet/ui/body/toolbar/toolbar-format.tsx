import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import type { ColorSlotIndex } from '@/shared/types/color-command';
import { ColorSelector, useColorStore } from '@/features/sheet-color';
import type { SheetToolbarFormatProps } from '../../../types';

/**
 * toolbar 서식 섹션 — sheet-edit 토글·B/I/U·color 계열(팔레트 트리거·color-select·color-reset).
 * 다중·단건·에딧 분기는 clip/color 훅 내장. color-select는 dialog 열림을 트리거가 소유.
 * 팔레트 스와치 8개는 트리거 열림(open) 상태에서만 표시. 스와치 클릭 시 color0..7 command 실행.
 */
const ToolbarFormat = ({
  actions: {
    isEditing,
    handleEditToggleClick,
    handleFormatClick,
    handleColorReset,
    handleColorClick,
  },
}: SheetToolbarFormatProps) => {
  const editOn = useT('toolbar.editOn');
  const editOff = useT('toolbar.editOff');
  const bold = useT('toolbar.bold');
  const italic = useT('toolbar.italic');
  const underline = useT('toolbar.underline');
  const colorSelect = useT('color.select');
  const colorReset = useT('color.reset');
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

  const paletteColors = useColorStore((state) => state.colors);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLElement | null>(null);

  const handleSelectorOpen = (event: MouseEvent<HTMLButtonElement>) => {
    selectorRef.current = event.currentTarget;
    setSelectorOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={isEditing ? 'default' : 'outline'}
        aria-pressed={isEditing}
        aria-label={isEditing ? editOn : editOff}
        onClick={handleEditToggleClick}
      >
        {isEditing ? editOn : editOff}
      </Button>
      <Button type="button" size="sm" aria-label={bold} onClick={() => handleFormatClick('bold')}>
        {bold}
      </Button>
      <Button
        type="button"
        size="sm"
        aria-label={italic}
        onClick={() => handleFormatClick('italic')}
      >
        {italic}
      </Button>
      <Button
        type="button"
        size="sm"
        aria-label={underline}
        onClick={() => handleFormatClick('underline')}
      >
        {underline}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={paletteOpen ? 'default' : 'outline'}
        aria-expanded={paletteOpen}
        aria-label={paletteAria}
        onClick={() => setPaletteOpen((open) => !open)}
      >
        {paletteAria}
      </Button>
      {paletteOpen ? (
        <ul role="listbox" aria-label={paletteAria} className="flex gap-1">
          {paletteColors.map((hex, index) => (
            <li key={index}>
              <button
                type="button"
                tabIndex={0}
                aria-label={slotLabels[index]}
                onClick={() => handleColorClick(`color${index as ColorSlotIndex}`)}
                style={{ '--color-slot': hex } as CSSProperties}
                className="block h-6 w-6 rounded-full border-2 border-white bg-[var(--color-slot)] shadow-[0_0_0_1px_#eee]"
              />
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" size="sm" aria-label={colorSelect} onClick={handleSelectorOpen}>
        {colorSelect}
      </Button>
      <Button type="button" size="sm" aria-label={colorReset} onClick={handleColorReset}>
        {colorReset}
      </Button>
      <ColorSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        prevFocusRef={selectorRef}
      />
    </>
  );
};

export { ToolbarFormat };
