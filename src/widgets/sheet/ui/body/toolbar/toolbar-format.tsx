import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import type { SheetToolbarFormatProps } from '../../../types';

/** toolbar 서식 섹션 — sheet-edit 토글·B/I/U. 다중·단건·에딧 분기는 clip 훅 내장 */
const ToolbarFormat = ({
  actions: { isEditing, handleEditToggleClick, handleFormatClick },
}: SheetToolbarFormatProps) => {
  const editOn = useT('toolbar.editOn');
  const editOff = useT('toolbar.editOff');
  const bold = useT('toolbar.bold');
  const italic = useT('toolbar.italic');
  const underline = useT('toolbar.underline');

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
    </>
  );
};

export { ToolbarFormat };
