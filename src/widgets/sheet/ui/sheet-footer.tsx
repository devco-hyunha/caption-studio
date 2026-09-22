import type { MouseEvent } from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useSheetTabRename } from '../lib/use-sheet-tab-rename';
import type { SheetFooterProps, SheetTabMenuState } from '../types';
import { SheetTab } from './sheet-tab';
import { SheetTabMenu } from './sheet-tab-menu';

const SheetFooter = ({
	tabs,
	activeIndex,
	className,
	onSelectTab,
	onAddTab,
	onDeleteTab,
	onRenameTab,
	onCopyTab,
}: SheetFooterProps) => {
	const [tabMenu, setTabMenu] = useState<SheetTabMenuState | null>(null);
	const {
		renamingIndex,
		draftName,
		isDraftInvalid,
		renameInputRef,
		renameInputSize,
		handleBeginRename,
		handleDraftChange,
		handleDraftKeyDown,
		handleDraftBlur,
		isRenaming,
	} = useSheetTabRename({ tabs, onRenameTab });

	const handleSelectTab = (index: number) => {
		if (isRenaming) return;
		onSelectTab?.(index);
	};

	const handleAddTab = () => {
		onAddTab?.();
	};

	const handleCopyTab = (index: number) => {
		onCopyTab?.(index);
	};

	const handleDeleteTab = (index: number) => {
		onDeleteTab?.(index);
	};

	const handleTabContextMenu = (event: MouseEvent<HTMLButtonElement>, index: number) => {
		event.preventDefault();
		setTabMenu({ index, x: event.clientX, y: event.clientY });
	};

	const handleTabMenuOpenChange = (open: boolean) => {
		if (!open) setTabMenu(null);
	};

	const canDeleteTab = tabs.length > 1;
	const menuTabName = tabMenu ? (tabs[tabMenu.index]?.name ?? null) : null;

	return (
		<footer
			data-slot="sheet-footer"
			role="navigation"
			aria-label="sheet tabs"
			className={cn(
				'flex min-h-8 shrink-0 items-center overflow-hidden border-t border-neutral-300 bg-neutral-100 p-0.5',
				className,
			)}
		>
			{/* 콘텐츠 폭까지 붙고, 넘치면 footer 너비로 제한 → 탭만 스크롤, 추가는 끝 고정 */}
			<div data-slot="sheet-tabs-cluster" className="flex max-w-full min-w-0 items-center gap-0.5">
				<div
					data-slot="sheet-tabs"
					role="tablist"
					className="flex min-w-0 items-center gap-0.5 overflow-x-auto overflow-y-hidden"
				>
					{tabs.map((tab, index) => (
						<SheetTab
							key={`${tab.name}-${index}`}
							name={tab.name}
							index={index}
							isActive={index === activeIndex}
							isRenaming={renamingIndex === index}
							draftName={draftName}
							isDraftInvalid={isDraftInvalid}
							renameInputSize={renameInputSize}
							renameInputRef={renameInputRef}
							onSelect={handleSelectTab}
							onContextMenu={handleTabContextMenu}
							onDraftChange={handleDraftChange}
							onDraftKeyDown={handleDraftKeyDown}
							onDraftBlur={handleDraftBlur}
						/>
					))}
				</div>
				<Button
					type="button"
					data-slot="sheet-tab-add"
					variant="ghost"
					size="icon-sm"
					className="shrink-0"
					aria-label="시트 추가"
					title="시트 추가"
					onClick={handleAddTab}
				>
					<Plus aria-hidden />
				</Button>
			</div>

			<SheetTabMenu
				menu={tabMenu}
				tabName={menuTabName}
				canDelete={canDeleteTab}
				onOpenChange={handleTabMenuOpenChange}
				onRename={handleBeginRename}
				onCopy={handleCopyTab}
				onDelete={handleDeleteTab}
			/>
		</footer>
	);
};

export { SheetFooter };
