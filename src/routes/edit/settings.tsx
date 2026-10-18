import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ShortkeySettings } from '@/features/shortkey';

/** `/edit/settings` — 부모(`EditPage`) 마운트 유지 + Radix Dialog 팝업. 닫기 = parent navigate */
const EditSettingsPage = () => {
  const navigate = useNavigate();
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // 진입 시 open 전 캡처 — DialogShell onCloseAutoFocus가 닫힘 후 이 포커스를 복원
  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) navigate({ to: '/edit' });
  };

  return <ShortkeySettings open onOpenChange={handleOpenChange} prevFocusRef={prevFocusRef} />;
};

export const Route = createFileRoute('/edit/settings')({
  ssr: false,
  component: EditSettingsPage,
});
