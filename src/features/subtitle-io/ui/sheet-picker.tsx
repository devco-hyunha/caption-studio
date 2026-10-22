import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import type { SheetPickerProps } from '../types';

/**
 * export 시트 피커 — 체크박스 다중 선택.
 * 헤더 체크박스는 전체 선택/전체 해제.
 */
const SheetPicker = ({ names, selected, onChange }: SheetPickerProps) => {
  const allLabel = useT('io.sheetAll');
  const pickerAria = useT('io.sheetPickerAria');
  const allChecked = names.length > 0 && selected.length === names.length;

  const handleAllChange = (checked: boolean) => {
    onChange(checked ? names.map((_, index) => index) : []);
  };

  const handleToggle = (index: number, checked: boolean) => {
    if (checked) {
      onChange([...selected, index]);
      return;
    }
    onChange(selected.filter((i) => i !== index));
  };

  if (names.length === 0) return null;

  return (
    <div role="group" aria-label={pickerAria} className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          aria-label={allLabel}
          checked={allChecked}
          onChange={(event) => handleAllChange(event.target.checked)}
        />
        <span>{allLabel}</span>
      </label>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {names.map((name, index) => {
          const checked = selected.includes(index);
          return (
            <li key={`${name}-${index}`} className="flex items-center gap-1.5 text-sm">
              <input
                id={`sheet-pick-${index}`}
                type="checkbox"
                aria-label={name}
                checked={checked}
                onChange={(event) => handleToggle(index, event.target.checked)}
              />
              <label htmlFor={`sheet-pick-${index}`} className={cn(checked && 'font-bold')}>
                {name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { SheetPicker };
