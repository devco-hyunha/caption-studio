import { SheetHistoryButtons } from '@/features/sheet-history';
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
}: SheetToolbarButtonsProps) => (
  <>
    <Button
      type="button"
      size="sm"
      variant={multipleActive ? 'default' : 'outline'}
      aria-pressed={multipleActive}
      aria-label="다중 선택 토글"
      onClick={handleToggleMultipleClick}
    >
      다중 선택
    </Button>
    <Button
      type="button"
      size="sm"
      aria-label="현재 행 아래 추가"
      disabled={multipleActive}
      onClick={handleInsertAtFocus}
    >
      행 추가
    </Button>
    <Button
      type="button"
      size="sm"
      aria-label="현재 행 삭제"
      disabled={multipleActive}
      onClick={handleRemoveAtFocus}
    >
      행 삭제
    </Button>
    <SheetHistoryButtons
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={handleUndo}
      onRedo={handleRedo}
    />
  </>
);

export { ToolbarButtons };
