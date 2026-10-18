import type { ReactNode, RefObject } from 'react';

/** DialogShell props — 열림 상태는 소비자 훅이 소유(cs-setting 등 다이얼로그 공통 셸) */
export interface DialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** dialog-head 제목 */
  title: string;
  /** dialog-body 슬롯 — 패널 내용(cs-setting·import/export 등) */
  children: ReactNode;
  /** 다이얼로그 진입 시 저장된 에딧창 포커스 — 닫힘 시 복원 */
  prevFocusRef: RefObject<HTMLElement | null>;
  /** Esc 인터셉트 — preventDefault 시 dismiss(닫힘) 막음. Radix capture 지점이라 내부 input보다 먼저 발동 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}
