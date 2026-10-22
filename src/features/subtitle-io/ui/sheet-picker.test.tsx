import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocaleStore } from '@/shared/lib/i18n';
import { SheetPicker } from './sheet-picker';

const NAMES = ['sheet1', 'sheet2', 'sheet3'];

describe('SheetPicker — 체크박스 다중 선택', () => {
  beforeEach(() => {
    useLocaleStore.getState().setLanguage('ko');
  });

  afterEach(cleanup);

  it('전체 선택 헤더 체크가 전체 선택·전체 해제 토글', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SheetPicker names={NAMES} selected={[0]} onChange={onChange} />);

    const all = screen.getByRole('checkbox', { name: '전체 선택' });
    fireEvent.click(all);
    expect(onChange).toHaveBeenLastCalledWith([0, 1, 2]);

    // 전체 선택된 상태로 재렌더 — 클릭하면 전체 해제
    rerender(<SheetPicker names={NAMES} selected={[0, 1, 2]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('개별 체크 추가·제거', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SheetPicker names={NAMES} selected={[0]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'sheet2' }));
    expect(onChange).toHaveBeenLastCalledWith([0, 1]);

    rerender(<SheetPicker names={NAMES} selected={[0, 1]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'sheet2' }));
    expect(onChange).toHaveBeenLastCalledWith([0]);
  });
});
