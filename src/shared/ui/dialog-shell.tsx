import { Dialog as DialogPrimitive } from 'radix-ui';
import { useT } from '@/shared/lib/i18n';
import type { DialogShellProps } from '@/shared/types/dialog';
import { Button } from './button';

/**
 * 공통 다이얼로그 셸.
 * dialog-head(제목 + 창 닫기 버튼) · dialog-body 슬롯 · overlay/Esc 닫힘 ·
 * 닫힘 시 prevFocusRef로 에딧창 포커스 복원.
 */
const DialogShell = ({ open, onOpenChange, title, children, prevFocusRef }: DialogShellProps) => {
  const closeLabel = useT('shell.dialogClose');

  // 닫힘 후 에딧창 포커스 복원 — ConfirmDialog와 동일 패턴
  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    prevFocusRef.current?.focus();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-999 bg-black/70"
        />
        <DialogPrimitive.Content
          data-slot="dialog-shell"
          onCloseAutoFocus={handleCloseAutoFocus}
          className="bg-background fixed top-12 left-1/2 z-999 w-160 -translate-x-1/2 shadow-lg"
        >
          <div
            data-slot="dialog-head"
            className="bg-primary flex items-center justify-between px-5 py-3.5"
          >
            <DialogPrimitive.Title
              data-slot="dialog-title"
              className="text-primary-foreground text-lg font-bold"
            >
              {title}
            </DialogPrimitive.Title>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-slot="dialog-close"
              aria-label={closeLabel}
              onClick={handleClose}
            >
              {closeLabel}
            </Button>
          </div>
          {/* body 슬롯 — Description은 설명 텍스트용이므로 사용하지 않는다(상호작용 콘텐츠 a11y) */}
          <div data-slot="dialog-body" className="p-5">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { DialogShell };
