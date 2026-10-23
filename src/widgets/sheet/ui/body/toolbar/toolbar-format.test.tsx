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
  handleColorReset: vi.fn(),
  handleColorClick: vi.fn(),
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

  it('color-reset 클릭 — handleColorReset 호출', () => {
    const actions = baseActions();
    renderFormat(actions);

    fireEvent.click(screen.getByRole('button', { name: '글자 색 초기화' }));

    expect(actions.handleColorReset).toHaveBeenCalledTimes(1);
  });

  it('color-select 클릭 — color selector dialog 열림', () => {
    const actions = baseActions();
    renderFormat(actions);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '색상 선택' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('비에딧 — 팔레트 스와치 미표시(트리거 닫힘)', () => {
    renderFormat(baseActions());

    expect(screen.queryByRole('listbox', { name: '글자 색 리스트' })).not.toBeInTheDocument();
  });

  it('트리거 클릭 — 팔레트 열림, 스와치 8개 표시, 클릭 시 color0..7 command', () => {
    const actions = baseActions();
    renderFormat(actions);

    const trigger = screen.getByRole('button', { name: '글자 색 리스트' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const listbox = screen.getByRole('listbox', { name: '글자 색 리스트' });
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '색상 1' }));
    fireEvent.click(screen.getByRole('button', { name: '색상 8' }));

    expect(actions.handleColorClick).toHaveBeenNthCalledWith(1, 'color0');
    expect(actions.handleColorClick).toHaveBeenNthCalledWith(2, 'color7');
  });

  it('재클릭 — 팔레트 닫힘, 스와치 미표시', () => {
    const actions = baseActions();
    renderFormat(actions);

    const trigger = screen.getByRole('button', { name: '글자 색 리스트' });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox', { name: '글자 색 리스트' })).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox', { name: '글자 색 리스트' })).not.toBeInTheDocument();
  });
});
