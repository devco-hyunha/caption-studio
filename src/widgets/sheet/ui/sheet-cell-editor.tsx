import type { CSSProperties, KeyboardEvent, MouseEvent, Ref } from 'react';
import { cn } from '@/shared/lib/utils';
import type { SheetCellEditorProps } from '../types';

const SheetCellEditor = ({
	mode = 'hidden',
	left,
	top,
	minWidth,
	minHeight,
	isMultiClip = false,
	className,
	wrapRef,
	inputRef,
	onInputKeyDown,
	onInputClick,
	onInputBlur,
}: SheetCellEditorProps) => {
	const isPositioned = mode === 'edit' || mode === 'focus';
	const isEditing = mode === 'edit';
	const hasPosition = isPositioned && left != null && top != null;

	const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		onInputKeyDown?.(event);
	};

	const handleWrapKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		// focus(선택) 상태에서 문자 입력 → 편집 활성화
		if (mode === 'focus') onInputKeyDown?.(event);
	};

	const handleInputClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		onInputClick?.(event);
	};

	const handleInputBlur = () => {
		onInputBlur?.();
	};

	return (
		<div
			ref={wrapRef as Ref<HTMLDivElement>}
			data-slot="sheet-cell-editor"
			// tabindex=-1, 포커스는 훅에서 input/wrap 지정
			tabIndex={-1}
			className={cn(
				// focus는 투명 유지(IME용), edit만 노출
				'sheet-trigger absolute',
				isEditing ? 'on z-[3] opacity-100' : 'z-[-1]',
				!isPositioned && '-top-[100%] -left-[100%] opacity-0',
				// visibility:hidden 금지 — IME/입력이 막힘. focus는 opacity만 0
				isPositioned && !isEditing && 'opacity-0 pointer-events-none',
				hasPosition &&
					'left-[var(--sheet-editor-left)] top-[var(--sheet-editor-top)]',
				className,
			)}
			style={
				hasPosition
					? ({
							'--sheet-editor-left': `${left}px`,
							'--sheet-editor-top': `${top}px`,
						} as CSSProperties)
					: undefined
			}
			onKeyDown={handleWrapKeyDown}
		>
			<div
				ref={inputRef as Ref<HTMLDivElement>}
				data-slot="sheet-cell-editor-input"
				className={cn(
					'sheet-input box-border w-full border border-black bg-white whitespace-nowrap outline-none select-text',
					'p-[var(--sheet-cell-padding,3px)]',
					minWidth != null && 'min-w-[var(--sheet-editor-min-width)]',
					minHeight != null && 'min-h-[var(--sheet-editor-min-height)]',
					isMultiClip && 'multi-clip !h-5',
				)}
				style={
					{
						...(minWidth != null && {
							'--sheet-editor-min-width': `${minWidth}px`,
						}),
						...(minHeight != null && {
							'--sheet-editor-min-height': `${minHeight}px`,
						}),
					} as CSSProperties
				}
				// focus/edit 모두 contenteditable — 선택 중 키·IME 기본 입력 유지
				contentEditable={isPositioned}
				suppressContentEditableWarning
				tabIndex={-1}
				onKeyDown={handleInputKeyDown}
				onClick={handleInputClick}
				onBlur={handleInputBlur}
			/>
		</div>
	);
};

export { SheetCellEditor };
