import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useLocaleStore } from './use-locale-store';
import { useT } from './use-t';

const Label = ({ k }: { k: string }) => {
  const label = useT(k);
  return <button aria-label={label}>{label}</button>;
};

describe('useT — locale 변경 시 리렌더', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  afterEach(() => {
    cleanup();
  });

  it('locale ko — ko 라벨 렌더', () => {
    render(<Label k="toolbar.undo" />);
    expect(screen.getByRole('button', { name: '실행취소' })).toBeInTheDocument();
  });

  it('setLanguage(en) — 같은 컴포넌트가 en 라벨로 자동 리렌더', () => {
    render(<Label k="toolbar.undo" />);
    expect(screen.getByRole('button', { name: '실행취소' })).toBeInTheDocument();

    act(() => {
      useLocaleStore.getState().setLanguage('en');
    });

    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '실행취소' })).not.toBeInTheDocument();
  });

  it('ENCC 승격 — en 라벨로 자동 리렌더', () => {
    render(<Label k="toolbar.redo" />);
    expect(screen.getByRole('button', { name: '재실행' })).toBeInTheDocument();

    act(() => {
      useLocaleStore.getState().setLanguage('ENCC');
    });

    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
  });
});
