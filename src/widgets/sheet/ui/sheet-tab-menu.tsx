import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { SheetTabMenuProps } from '../types';

const SheetTabMenu = ({
	menu,
	tabName,
	canDelete,
	onOpenChange,
	onRename,
	onCopy,
	onDelete,
}: SheetTabMenuProps) => {
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
						'left-[var(--sheet-tab-menu-x)] top-[var(--sheet-tab-menu-y)]',
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
				aria-label={tabName ? `${tabName} 메뉴` : '시트 탭 메뉴'}
				side="top"
				align="start"
				sideOffset={4}
				className={cn('w-auto min-w-36')}
				onCloseAutoFocus={handleCloseAutoFocus}
			>
				{menu != null && (
					<>
						<DropdownMenuItem onSelect={() => onRename(menu.index)}>
							이름 바꾸기
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => onCopy(menu.index)}>복사</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							disabled={!canDelete}
							onSelect={() => onDelete(menu.index)}
						>
							삭제
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export { SheetTabMenu };
