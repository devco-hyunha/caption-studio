import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocaleStore } from '@/shared/lib/i18n';
import { useColorStore } from '../model/use-color-store';
import { ColorSelector } from './color-selector';

const DEFAULTS = [
  '#ff0000',
  '#ff00ff',
  '#aa00ff',
  '#0000ff',
  '#00ffff',
  '#00ff00',
  '#ffff00',
  '#ffaa00',
];

const renderSelector = () => {
  const onOpenChange = vi.fn();
  const prevFocusRef: React.RefObject<HTMLElement | null> = { current: null };
  render(<ColorSelector open onOpenChange={onOpenChange} prevFocusRef={prevFocusRef} />);
  return onOpenChange;
};

describe('ColorSelector — 팔레트·피커·store 반영', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
    useColorStore.setState({ colors: [...DEFAULTS] });
  });

  afterEach(() => {
    cleanup();
  });

  it('팔레트 셀 클릭 → hex 입력·적용 → 해당 index 셀만 store 갱신', () => {
    renderSelector();

    fireEvent.click(screen.getByRole('button', { name: '색상 1' }));

    const hexInput = screen.getByRole('textbox', { name: 'Hex color' });
    fireEvent.change(hexInput, { target: { value: '00ff00' } });
    fireEvent.blur(hexInput);

    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    const colors = useColorStore.getState().colors;
    expect(colors[0]).toBe('#00ff00');
    expect(colors[1]).toBe('#ff00ff');
    expect(colors).toHaveLength(8);
  });

  it('미선택 적용 — 첫 slot(index 0) active, 조정 색이 index 0에 저장', () => {
    renderSelector();

    const hexInput = screen.getByRole('textbox', { name: 'Hex color' });
    fireEvent.change(hexInput, { target: { value: '00ff00' } });

    fireEvent.click(screen.getByRole('button', { name: '적용' }));

    const colors = useColorStore.getState().colors;
    expect(colors[0]).toBe('#00ff00');
    expect(colors[1]).toBe('#ff00ff');
  });

  it('dialog 열림 — title 색상 선택·팔레트 listbox 렌더', () => {
    renderSelector();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '글자 색 리스트' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^색상 \d$/ })).toHaveLength(8);
  });
});
