import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { SheetHistoryButtonsProps } from '../types';

/** Verify용 undo/redo 버튼 — canUndo/canRedo로 disabled */
const SheetHistoryButtons = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
}: SheetHistoryButtonsProps) => {
  const undo = useT('toolbar.undo');
  const redo = useT('toolbar.redo');

  return (
    <div
      data-slot="sheet-history-buttons"
      role="group"
      aria-label={undo}
      className={cn('flex items-center gap-2', className)}
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={undo}
        aria-keyshortcuts="Control+Z"
        disabled={!canUndo}
        onClick={onUndo}
      >
        {undo}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={redo}
        aria-keyshortcuts="Control+Y"
        disabled={!canRedo}
        onClick={onRedo}
      >
        {redo}
      </Button>
    </div>
  );
};

export { SheetHistoryButtons };
