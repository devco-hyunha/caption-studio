import type { RefObject } from 'react';
import type { Fn } from './fn';

/** confirm 셸 옵션 — 레거시 `feedback.js` ConfirmOptions parity */
export interface ConfirmOptions {
  title?: string | false;
  content?: string | false;
  successLabel?: string | false;
  cancelLabel?: string | false;
  /** 레거시 기본 false — true일 때만 overlay/Esc로 닫힘 */
  bgDismiss?: boolean;
  success?: Fn<void> | null;
  cancel?: Fn<void> | null;
}

/** ConfirmDialog props — confirm 훅(`useConfirm`)의 열림·옵션·포커스 정본 */
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ConfirmOptions | null;
  /** confirm 진입 시 저장된 에딧창 포커스 — 닫힘 시 복원 */
  prevFocusRef: RefObject<HTMLElement | null>;
}
