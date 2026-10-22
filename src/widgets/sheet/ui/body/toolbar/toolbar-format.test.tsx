import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocaleStore } from '@/shared/lib/i18n';
import type { SheetToolbarFormatActions } from '../../../types';
import { ToolbarFormat } from './toolbar-format';

const renderFormat = (actions: SheetToolbarFormatActions) => {
  render(<ToolbarFormat actions={actions} />);
};

const baseActions: (overrides?: Partial<SheetToolbarFormatActions>) => SheetToolbarFormatActions = (
  overrides = {},
) => ({
  isEditing: false,
  handleEditToggleClick: vi.fn(),
  handleFormatClick: vi.fn(),
  ...overrides,
});

describe('ToolbarFormat — 서식 버튼', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  afterEach(() => {
    cleanup();
  });

  it('비에딧 — editOff 라벨·aria-pressed false', () => {
    renderFormat(baseActions());

    const toggle = screen.getByRole('button', { name: '자막편집 OFF' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', { name: '자막편집 ON' })).not.toBeInTheDocument();
  });

  it('에딧 중 — editOn 라벨·aria-pressed true', () => {
    renderFormat(baseActions({ isEditing: true }));

    const toggle = screen.getByRole('button', { name: '자막편집 ON' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('sheet-edit 클릭 — handleEditToggleClick 호출', () => {
    const actions = baseActions();
    renderFormat(actions);

    fireEvent.click(screen.getByRole('button', { name: '자막편집 OFF' }));

    expect(actions.handleEditToggleClick).toHaveBeenCalledTimes(1);
  });

  it('B/I/U 클릭 — 각 명령으로 handleFormatClick 호출', () => {
    const actions = baseActions();
    renderFormat(actions);

    fireEvent.click(screen.getByRole('button', { name: '두껍게' }));
    fireEvent.click(screen.getByRole('button', { name: '기울임' }));
    fireEvent.click(screen.getByRole('button', { name: '밑줄' }));

    expect(actions.handleFormatClick).toHaveBeenNthCalledWith(1, 'bold');
    expect(actions.handleFormatClick).toHaveBeenNthCalledWith(2, 'italic');
    expect(actions.handleFormatClick).toHaveBeenNthCalledWith(3, 'underline');
  });
});
