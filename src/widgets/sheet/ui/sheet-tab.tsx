import { cn } from '@/shared/lib/utils';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { SheetTabProps } from '../types';

const getTabClass = (isActive: boolean) =>
	isActive
		? 'bg-white text-neutral-900 hover:bg-white hover:text-neutral-900'
		: 'text-neutral-400 hover:text-neutral-400';

const SheetTab = ({
	name,
	index,
	isActive,
	isRenaming,
	draftName,
	isDraftInvalid,
	renameInputSize,
	renameInputRef,
	onSelect,
	onContextMenu,
	onDraftChange,
	onDraftKeyDown,
	onDraftBlur,
}: SheetTabProps) => {
	if (isRenaming) {
		return (
			<Input
				ref={renameInputRef}
				type="text"
				data-slot="sheet-tab-rename"
				data-index={index}
				aria-label={`${name} 이름 바꾸기`}
				aria-invalid={isDraftInvalid || undefined}
				spellCheck={false}
				size={renameInputSize}
				value={draftName}
				className={cn(
					buttonVariants({
						variant: isActive ? 'default' : 'ghost',
						size: 'sm',
					}),
					'field-sizing-content w-auto cursor-text justify-start px-2',
					'select-text active:translate-y-0',
					isActive
						? getTabClass(true)
						: 'border-transparent bg-transparent text-neutral-400 shadow-none hover:bg-transparent hover:text-neutral-400 focus-visible:border-transparent',
				)}
				onChange={(event) => onDraftChange(event, index)}
				onKeyDown={(event) => onDraftKeyDown(event, index)}
				onBlur={(event) => onDraftBlur(event, index)}
			/>
		);
	}

	return (
		<Button
			type="button"
			role="tab"
			aria-selected={isActive}
			aria-label={name}
			data-slot="sheet-tab"
			data-index={index}
			variant={isActive ? 'default' : 'ghost'}
			size="sm"
			className={cn('max-w-32 shrink-0 justify-start px-2', getTabClass(isActive))}
			onContextMenu={(event) => onContextMenu(event, index)}
			onClick={() => onSelect(index)}
		>
			<span data-slot="sheet-tab-name" className="truncate">
				{name}
			</span>
		</Button>
	);
};

export { SheetTab };
