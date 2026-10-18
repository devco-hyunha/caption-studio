import { cn } from '@/shared/lib/utils';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import type { ShortkeyCustomRowProps } from '../../types';
import { useCustomKeyEdit } from '../../lib/settings/use-custom-key-edit';
import { LabelKbd } from './fixed-key';

/** 커스텀 키 항목 — change/cancel 토글 + controlled input. 편집 제어는 useCustomKeyEdit */
const CustomKeyRow = ({
  id,
  editing,
  raw,
  onStartEdit,
  onRawChange,
  onCancelEdit,
}: ShortkeyCustomRowProps) => {
  const changeLabel = useT('shortkey.change');
  const cancelLabel = useT('shortkey.cancel');
  const changeAria = useT('shortkey.changeAria');
  const { inputRef, formRef, handleChange, handleKeyDown, handleSubmit } = useCustomKeyEdit({
    id,
    editing,
    raw,
    onStartEdit,
    onRawChange,
    onCancelEdit,
  });

  return (
    <li className="py-1">
      <form ref={formRef} className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
        <LabelKbd id={id} />
        <input
          ref={inputRef}
          type="text"
          aria-label={changeAria}
          value={raw}
          readOnly
          className={cn(
            'border-input bg-background h-8 w-28 rounded-md border px-2 text-sm',
            !editing && 'hidden',
          )}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={changeAria}
          onClick={handleChange}
        >
          {changeLabel}
        </Button>
        {editing ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
            {cancelLabel}
          </Button>
        ) : null}
      </form>
    </li>
  );
};

export { CustomKeyRow };
