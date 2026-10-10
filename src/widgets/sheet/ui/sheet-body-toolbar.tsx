import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { SheetBodyToolbarProps } from '../types';

/** 시트 상단 툴바 — 다중 선택 토글과 포커스 행 추가/삭제 */
const SheetBodyToolbar = ({
	multipleActive,
	onToggleMultiple,
	onInsertRow,
	onRemoveRow,
	className,
}: SheetBodyToolbarProps) => {
	return (
		<div
			data-slot="sheet-body-toolbar"
			role="toolbar"
			aria-label="확인용 툴바"
			className={cn(
				'flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5',
				className,
			)}
		>
			<Button
				type="button"
				size="sm"
				variant={multipleActive ? 'default' : 'outline'}
				aria-pressed={multipleActive}
				aria-label="다중 선택 토글"
				onClick={onToggleMultiple}
			>
				다중 선택
			</Button>
			<Button
				type="button"
				size="sm"
				aria-label="현재 행 아래 추가"
				disabled={multipleActive}
				onClick={onInsertRow}
			>
				행 추가
			</Button>
			<Button
				type="button"
				size="sm"
				aria-label="현재 행 삭제"
				disabled={multipleActive}
				onClick={onRemoveRow}
			>
				행 삭제
			</Button>
		</div>
	);
};

export { SheetBodyToolbar };
