import type { CSSProperties, KeyboardEvent, MouseEvent, Ref } from 'react';
import { cn } from '@/shared/lib/utils';
import type { SheetCellEditorProps } from '../types';

/** 셀 에디터 오버레이 — focus(투명·IME 유지) / edit(노출)의 contenteditable 입력 */
const SheetCellEditor = ({
  mode = 'hidden',
  rect,
  isMultiClip = false,
  className,
  wrapRef,
  inputRef,
  inputEvents,
}: SheetCellEditorProps) => {
  const isPositioned = mode === 'edit' || mode === 'focus';
  const isEditing = mode === 'edit';
  const hasPosition = isPositioned && rect?.left != null && rect?.top != null;

  const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    inputEvents?.onInputKeyDown?.(event);
  };

  const handleWrapKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // focus(선택) 상태에서 문자 입력 → 편집 활성화
    if (mode === 'focus') inputEvents?.onInputKeyDown?.(event);
  };

  const handleInputClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    inputEvents?.onInputClick?.(event);
  };

  const handleInputBlur = () => {
    inputEvents?.onInputBlur?.();
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
        isPositioned && !isEditing && 'pointer-events-none opacity-0',
        hasPosition && 'top-[var(--sheet-editor-top)] left-[var(--sheet-editor-left)]',
        className,
      )}
      style={
        hasPosition
          ? ({
              '--sheet-editor-left': `${rect?.left}px`,
              '--sheet-editor-top': `${rect?.top}px`,
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
          rect?.minWidth != null && 'min-w-[var(--sheet-editor-min-width)]',
          rect?.minHeight != null && 'min-h-[var(--sheet-editor-min-height)]',
          isMultiClip && 'multi-clip !h-5',
        )}
        style={
          {
            ...(rect?.minWidth != null && {
              '--sheet-editor-min-width': `${rect.minWidth}px`,
            }),
            ...(rect?.minHeight != null && {
              '--sheet-editor-min-height': `${rect.minHeight}px`,
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
