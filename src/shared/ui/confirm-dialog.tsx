import { Dialog as DialogPrimitive } from 'radix-ui';
import { useT } from '@/shared/lib/i18n';
import type { ConfirmDialogProps } from '@/shared/types/confirm';
import { Button } from './button';

/** confirm 셸 — title·content·예/아니오 버튼 */
const ConfirmDialog = ({ open, onOpenChange, options, prevFocusRef }: ConfirmDialogProps) => {
  const yesLabel = useT('shell.yes');
  const noLabel = useT('shell.no');

  const title = options?.title || null;
  const content = options?.content || null;
  const bgDismiss = options?.bgDismiss ?? false;
  const successLabel = options?.successLabel === false ? null : (options?.successLabel ?? yesLabel);
  const cancelLabel = options?.cancelLabel === false ? null : (options?.cancelLabel ?? noLabel);

  // 닫힘 후 에딧창 포커스 복원
  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    prevFocusRef.current?.focus();
  };

  const handleSuccess = () => {
    options?.success?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    options?.cancel?.();
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root
      open={open}
      // bgDismiss=false(기본)이면 overlay·Esc로 닫히지 않음. bgDismiss는 close만 (콜백 없음)
      onOpenChange={(next) => {
        if (next || !bgDismiss) return;
        onOpenChange(false);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="confirm-overlay"
          className="fixed inset-0 z-999 bg-black/70"
        />
        <DialogPrimitive.Content
          data-slot="confirm-box"
          onCloseAutoFocus={handleCloseAutoFocus}
          className="bg-background fixed top-12 left-1/2 z-999 w-75 -translate-x-1/2 shadow-lg"
        >
          {/* Radix a11y 필수 Title — title:false는 sr-only로 유지 */}
          <DialogPrimitive.Title
            data-slot="confirm-title"
            className={
              title ? 'bg-primary text-primary-foreground px-5 py-3.5 text-lg font-bold' : 'sr-only'
            }
          >
            {title ?? yesLabel}
          </DialogPrimitive.Title>
          {content ? (
            // 시트 데이터 서식 예외 — content `<br/>` 인라인 HTML 허용
            <div
              data-slot="confirm-content"
              className="text-foreground px-5 py-5 text-sm leading-5"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : null}
          {successLabel || cancelLabel ? (
            <div data-slot="confirm-btns" className="flex justify-end gap-1.5 px-5 pt-0 pb-5">
              {successLabel ? (
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground h-8.5 px-3.5 text-sm"
                  onClick={handleSuccess}
                >
                  {successLabel}
                </Button>
              ) : null}
              {cancelLabel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8.5 px-3.5 text-sm"
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { ConfirmDialog };
