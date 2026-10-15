import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useSheetSearchStore } from '../model/use-sheet-search-store';
import { SheetSearchPanel } from './sheet-search-panel';

const TIMELINES: SheetTimelineItem[] = [{ text: 'hello', memo: '' }];

const resetStore = () => {
  useSheetSearchStore.setState({
    searchPanelOpen: true,
    searchHits: [],
    searchCurrent: -1,
    searchInputFocused: false,
    errorSearchActive: false,
    searchFocusSignal: 0,
  });
};

describe('SheetSearchPanel — Esc', () => {
  beforeEach(() => {
    resetStore();
  });

  it('검색 input 포커스 중 Esc — 패널 닫힘 (closeSearchPanel)', () => {
    render(<SheetSearchPanel format="smi" timelines={TIMELINES} rows={[]} onJump={() => {}} />);

    const input = screen.getByRole('searchbox', { name: '검색어' });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(useSheetSearchStore.getState().searchPanelOpen).toBe(false);
  });
});
