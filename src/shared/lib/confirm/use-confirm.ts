import { useRef, useState } from 'react';
import type { ConfirmOptions } from '@/shared/types/confirm';

/**
 * confirm 셸 훅 — 열림·옵션·콜백 분기는 ConfirmDialog가 소비.
 * close 후 success/cancel 호출.
 * confirm 진입 시 document.activeElement(에딧창)를 저장 →
 * ConfirmDialog 닫힘 시 prevFocusRef로 contenteditable 포커스 복원.
 */
const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const confirm = (next: ConfirmOptions) => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    setOptions(next);
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setOpen(false);
  };

  return { open, options, confirm, handleOpenChange, prevFocusRef };
};

export { useConfirm };
