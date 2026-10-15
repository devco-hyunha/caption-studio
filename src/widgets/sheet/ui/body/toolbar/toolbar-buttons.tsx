import { SheetHistoryButtons } from '@/features/sheet-history';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import type { SheetToolbarButtonsProps } from '../../../types';

/** toolbar 버튼 섹션 — 다중 선택·행 CRUD·undo/redo (번들 소비) */
const ToolbarButtons = ({
  actions: {
    multipleActive,
    handleToggleMultipleClick,
    handleInsertAtFocus,
    handleRemoveAtFocus,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
  },
}: SheetToolbarButtonsProps) => {
  const multiple = useT('toolbar.multiple');
  const insert = useT('toolbar.insert');
  const remove = useT('toolbar.remove');

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={multipleActive ? 'default' : 'outline'}
        aria-pressed={multipleActive}
        aria-label={multiple}
        onClick={handleToggleMultipleClick}
      >
        {multiple}
      </Button>
      <Button
        type="button"
        size="sm"
        aria-label={insert}
        disabled={multipleActive}
        onClick={handleInsertAtFocus}
      >
        {insert}
      </Button>
      <Button
        type="button"
        size="sm"
        aria-label={remove}
        disabled={multipleActive}
        onClick={handleRemoveAtFocus}
      >
        {remove}
      </Button>
      <SheetHistoryButtons
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
    </>
  );
};

export { ToolbarButtons };
