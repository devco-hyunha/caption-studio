import { cn } from '@/shared/lib/utils';
import type { SheetScrollContainerProps } from '../../types';

/**
 * sheet-body scroll 셸 — 스크롤 래퍼 + content 래퍼만 렌더하는 presentational 컴포넌트.
 * refs·scroll 이벤트는 sheet-body(useSheetWindow)가 소유, 셸은 렌더만.
 */
const SheetScrollContainer = ({
  scrollRef,
  contentRef,
  onScroll,
  children,
  className,
}: SheetScrollContainerProps) => (
  <div
    ref={scrollRef}
    data-slot="sheet-body"
    role="presentation"
    className={cn('relative h-full min-h-0 flex-1 overflow-auto', className)}
    onScroll={onScroll}
  >
    <div
      ref={contentRef}
      data-slot="sheet-body-scroll"
      className="relative w-full min-w-[var(--sheet-contain-min)]"
    >
      {children}
    </div>
  </div>
);

export { SheetScrollContainer };
