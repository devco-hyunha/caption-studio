import { useState, type ChangeEvent } from 'react';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { SmiMetaFieldsProps } from '../types';

/**
 * SMI 메타 편집 — Name / lang 기본 UI.
 * 항상 열림 불필요 — 토글로 펴는 기본 form. 디자인은 붙이지 않는다.
 */
const SmiMetaFields = ({ meta, onChange }: SmiMetaFieldsProps) => {
  const [open, setOpen] = useState(false);
  const toggleLabel = useT('io.smiMeta');
  const nameAria = useT('io.smiNameAria');
  const langAria = useT('io.smiLangAria');

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...meta, smiName: event.target.value });
  };

  const handleLangChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...meta, smiLang: event.target.value });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" size="sm" aria-expanded={open} onClick={handleToggle}>
        {toggleLabel}
      </Button>
      {open ? (
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span>Name</span>
            <Input aria-label={nameAria} value={meta.smiName} onChange={handleNameChange} />
          </label>
          <label className="flex items-center gap-1 text-sm">
            <span>lang</span>
            <Input aria-label={langAria} value={meta.smiLang} onChange={handleLangChange} />
          </label>
        </div>
      ) : null}
    </div>
  );
};

export { SmiMetaFields };
