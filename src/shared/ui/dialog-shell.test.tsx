import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode, RefObject } from 'react';
import { useLocaleStore } from '@/shared/lib/i18n';
import { DialogShell } from './dialog-shell';

const resetLocale = () => {
  useLocaleStore.setState({ locale: 'ko' });
};

const renderShell = (children: ReactNode, open = true) => {
  const onOpenChange = vi.fn();
  const prevFocusRef: RefObject<HTMLElement | null> = { current: null };
  render(
    <DialogShell open={open} onOpenChange={onOpenChange} title="설정" prevFocusRef={prevFocusRef}>
      {children}
    </DialogShell>,
  );
  return onOpenChange;
};

describe('DialogShell — 공통 다이얼로그 셸', () => {
  beforeEach(resetLocale);
  afterEach(cleanup);

  it('열림 — 제목·body 슬롯·창 닫기 버튼 렌더', () => {
    renderShell(<p>panel content</p>);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('panel content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '창 닫기' })).toBeInTheDocument();
  });

  it('창 닫기 버튼 — onOpenChange(false)', () => {
    const onOpenChange = renderShell(<p>content</p>);

    fireEvent.click(screen.getByRole('button', { name: '창 닫기' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Esc — overlay/Esc로 닫힘(onOpenChange false)', () => {
    const onOpenChange = renderShell(<p>content</p>);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('locale en — 창 닫기 라벨 전환', () => {
    useLocaleStore.getState().setLanguage('en');
    renderShell(<p>content</p>);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  // 닫힘 시 에딧창 포커스 복원(prevFocusRef): Radix Presence가 jsdom에서 애니메이션
  // 완료를 못 해 onCloseAutoFocus 미발화 → 수동 브라우저 Verify로 확인 (quality-verification §3)
});
