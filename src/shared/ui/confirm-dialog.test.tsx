import { fireEvent, render, renderHook, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocaleStore } from '@/shared/lib/i18n';
import { useConfirm } from '@/shared/lib/confirm/use-confirm';
import type { RefObject } from 'react';
import type { ConfirmOptions } from '@/shared/types/confirm';
import { ConfirmDialog } from './confirm-dialog';

const resetLocale = () => {
  useLocaleStore.setState({ locale: 'ko' });
};

describe('ConfirmDialog — 콜백 분기', () => {
  beforeEach(resetLocale);
  afterEach(cleanup);

  const renderConfirm = (options: ConfirmOptions, open = true) => {
    const onOpenChange = vi.fn();
    const prevFocusRef: RefObject<HTMLElement | null> = { current: null };
    render(
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        options={options}
        prevFocusRef={prevFocusRef}
      />,
    );
    return onOpenChange;
  };

  it('예 버튼 — success 호출 후 닫힘', () => {
    const success = vi.fn();
    const cancel = vi.fn();
    const onOpenChange = renderConfirm({ title: 't', content: 'c', success, cancel });

    fireEvent.click(screen.getByRole('button', { name: '예' }));

    expect(success).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('아니오 버튼 — cancel 호출 후 닫힘', () => {
    const success = vi.fn();
    const cancel = vi.fn();
    const onOpenChange = renderConfirm({ title: 't', content: 'c', success, cancel });

    fireEvent.click(screen.getByRole('button', { name: '아니오' }));

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('bgDismiss=true + Esc — close(onOpenChange false)만, 콜백 없음', () => {
    const success = vi.fn();
    const cancel = vi.fn();
    const onOpenChange = renderConfirm({
      title: 't',
      content: 'c',
      bgDismiss: true,
      success,
      cancel,
    });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(success).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('bgDismiss=false(기본) + Esc — 닫히지 않음', () => {
    const onOpenChange = renderConfirm({ title: 't', content: 'c' });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('content는 인라인 HTML(<br/>) 렌더 — 시트 서식 허용', () => {
    const prevFocusRef: RefObject<HTMLElement | null> = { current: null };
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        options={{ title: 't', content: 'a<br />b' }}
        prevFocusRef={prevFocusRef}
      />,
    );
    // Radix Portal는 document.body에 렌더
    const content = document.body.querySelector('[data-slot="confirm-content"]');
    expect(content?.querySelector('br')).not.toBeNull();
    expect(content?.textContent).toContain('a');
    expect(content?.textContent).toContain('b');
  });

  it('locale en — 예/아니오 라벨 전환', () => {
    useLocaleStore.getState().setLanguage('en');
    renderConfirm({ title: 't', content: 'c' });

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('confirm 진입 — document.activeElement(에딧창)를 prevFocusRef에 저장', () => {
    const editor = document.createElement('div');
    // jsdom focusability는 contenteditable 속성 기반 — property setter는 속성 반영 안 함
    editor.setAttribute('contenteditable', 'true');
    document.body.appendChild(editor);
    editor.focus();

    const { result } = renderHook(() => useConfirm());
    result.current.confirm({ title: 't' });

    expect(result.current.prevFocusRef.current).toBe(editor);
    editor.remove();
  });

  // 닫힘 시 에딧창 포커스 복원: Radix Presence가 jsdom에서 애니메이션 완료 못 함
  // → onCloseAutoFocus 미발화. 수동 브라우저 Verify로 확인 (quality-verification §3)
});
