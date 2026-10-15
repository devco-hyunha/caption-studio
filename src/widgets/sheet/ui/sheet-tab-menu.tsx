import type { CSSProperties } from 'react';
import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { SheetTabMenuProps } from '../types';

/** 시트 탭 우클릭 메뉴 — 숨은 앵커 기준으로 시트 추가/복사/삭제 */
const SheetTabMenu = ({
  menu,
  tabName,
  canDelete,
  onOpenChange,
  onRename,
  onCopy,
  onDelete,
}: SheetTabMenuProps) => {
  const copyLabel = useT('sheet.tab.copy');
  const deleteLabel = useT('sheet.tab.delete');
  const renameLabel = useT('sheet.tab.rename');
  const menuAria = useT('sheet.tab.menuAria');
  const menuSuffix = useT('sheet.tab.menuSuffix');

  const handleCloseAutoFocus = (event: Event) => {
    // 트리거(숨은 앵커)로 포커스 복귀 방지 → rename input이 포커스 유지
    event.preventDefault();
  };

  return (
    <DropdownMenu open={menu != null} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          data-slot="sheet-tab-menu-anchor"
          className={cn(
            'pointer-events-none fixed size-0 overflow-hidden opacity-0',
            'top-[var(--sheet-tab-menu-y)] left-[var(--sheet-tab-menu-x)]',
          )}
          style={
            {
              '--sheet-tab-menu-x': `${menu?.x ?? 0}px`,
              '--sheet-tab-menu-y': `${menu?.y ?? 0}px`,
            } as CSSProperties
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        aria-label={tabName ? `${tabName} ${menuSuffix}` : menuAria}
        side="top"
        align="start"
        sideOffset={4}
        className={cn('w-auto min-w-36')}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {menu != null && (
          <>
            <DropdownMenuItem onSelect={() => onRename(menu.index)}>{renameLabel}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCopy(menu.index)}>{copyLabel}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!canDelete}
              onSelect={() => onDelete(menu.index)}
            >
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { SheetTabMenu };
