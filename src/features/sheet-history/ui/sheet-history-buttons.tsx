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
}: SheetHistoryButtonsProps) => (
  <div
    data-slot="sheet-history-buttons"
    role="group"
    aria-label="실행 취소"
    className={cn('flex items-center gap-2', className)}
  >
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-label="실행취소"
      aria-keyshortcuts="Control+Z"
      disabled={!canUndo}
      onClick={onUndo}
    >
      실행취소
    </Button>
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-label="재실행"
      aria-keyshortcuts="Control+Y"
      disabled={!canRedo}
      onClick={onRedo}
    >
      재실행
    </Button>
  </div>
);

export { SheetHistoryButtons };
