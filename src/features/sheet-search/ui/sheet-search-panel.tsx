import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useT } from '@/shared/lib/i18n';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { countErrorRows } from '../lib/error-hits';
import { useSheetSearchStore } from '../model/use-sheet-search-store';
import type { SheetSearchPanelProps } from '../types';

/**
 * 시트 검색 패널 — 쿼리·prev/next·결과 `n/m`·error-search.
 * 풀 검색 셸(i18n/툴바)은 후속(S6).
 */
const SheetSearchPanel = ({ format, timelines, rows, onJump }: SheetSearchPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const open = useSheetSearchStore((state) => state.searchPanelOpen);
  const searchFocusSignal = useSheetSearchStore((state) => state.searchFocusSignal);
  const searchCurrent = useSheetSearchStore((state) => state.searchCurrent);
  const searchHits = useSheetSearchStore((state) => state.searchHits);
  const errorSearchActive = useSheetSearchStore((state) => state.errorSearchActive);
  const runSearch = useSheetSearchStore((state) => state.runSearch);
  const searchStep = useSheetSearchStore((state) => state.searchStep);
  const toggleSearchPanel = useSheetSearchStore((state) => state.toggleSearchPanel);
  const closeSearchPanel = useSheetSearchStore((state) => state.closeSearchPanel);
  const toggleErrorSearch = useSheetSearchStore((state) => state.toggleErrorSearch);
  const setSearchInputFocused = useSheetSearchStore((state) => state.setSearchInputFocused);
  const canPrev = useSheetSearchStore((state) => state.canSearchPrev());
  const canNext = useSheetSearchStore((state) => state.canSearchNext());

  const searchLabel = useT('search.label');
  const searchInput = useT('search.input');
  const prevLabel = useT('search.prev');
  const nextLabel = useT('search.next');
  const errorLabel = useT('search.error');
  const findLabel = useT('search.find');
  const formAria = useT('search.formAria');
  const findAria = useT('search.findAria');
  const errorCountLabel = useT('search.errorCount');
  const noErrorLabel = useT('search.noError');

  const errorCount = countErrorRows(rows);

  // 열릴 때 input focus — 버튼·`Ctrl+/` 단축키 공용
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 열려 있는 상태에서 `Ctrl+/` 재압 — input 재포커스 (신호 증가 시)
  useEffect(() => {
    if (searchFocusSignal > 0) inputRef.current?.focus();
  }, [searchFocusSignal]);

  const handleToggle = () => {
    toggleSearchPanel();
    // 닫을 때 hits/query는 toggleSearchPanel이 초기화
  };

  const handleSearchFocus = () => {
    setSearchInputFocused(true);
  };

  const handleSearchBlur = () => {
    setSearchInputFocused(false);
  };

  // 검색 input 포커스 중 Esc — 패널 닫기 (전역 Esc는 input 밖에서만 발화)
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeSearchPanel();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputRef.current?.value ?? '';
    const hit = runSearch(query, timelines, format);
    if (hit) onJump(hit);
  };

  const handlePrev = () => {
    const hit = searchStep('prev');
    if (hit) onJump(hit);
  };

  const handleNext = () => {
    const hit = searchStep('next');
    if (hit) onJump(hit);
  };

  const handleErrorSearchChange = () => {
    const wasActive = errorSearchActive;
    const hit = toggleErrorSearch(rows);
    // 체크 시 input 비움
    if (!wasActive && inputRef.current) inputRef.current.value = '';
    if (hit) onJump(hit);
  };

  const resultLabel = searchHits.length > 0 ? `${searchCurrent + 1}/${searchHits.length}` : '0/0';

  return (
    <div data-slot="sheet-search-panel" className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={open ? 'default' : 'outline'}
        aria-pressed={open}
        aria-label={searchLabel}
        onClick={handleToggle}
      >
        {searchLabel}
      </Button>
      {open ? (
        <form
          className="flex flex-wrap items-center gap-2"
          aria-label={formAria}
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            type="search"
            name="sheet-search"
            aria-label={searchInput}
            placeholder={searchInput}
            className="h-8 w-52"
            disabled={errorSearchActive}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            aria-label={findAria}
            disabled={errorSearchActive}
          >
            {findLabel}
          </Button>
          <label className="flex items-center gap-1 text-sm" htmlFor="sheet-error-search">
            <input
              id="sheet-error-search"
              type="checkbox"
              aria-label={errorLabel}
              checked={errorSearchActive}
              onChange={handleErrorSearchChange}
            />
            <span aria-live="polite">
              {errorCount > 0 ? `${errorCount}${errorCountLabel}` : noErrorLabel}
            </span>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label={prevLabel}
            disabled={!canPrev}
            onClick={handlePrev}
          >
            {prevLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label={nextLabel}
            disabled={!canNext}
            onClick={handleNext}
          >
            {nextLabel}
          </Button>
          <span className="text-muted-foreground text-xs" aria-live="polite">
            {resultLabel}
          </span>
        </form>
      ) : null}
    </div>
  );
};

export { SheetSearchPanel };
