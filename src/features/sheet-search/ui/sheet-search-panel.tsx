import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { countErrorRows } from '../lib/error-hits';
import { useSheetSearchStore } from '../model/use-sheet-search-store';
import type { SheetSearchPanelProps } from '../types';

/**
 * 시트 검색 패널 — 쿼리·prev/next·결과 `n/m`·error-search(`/` search.js parity).
 * 풀 검색 셸(i18n/툴바)은 후속(S6).
 */
const SheetSearchPanel = ({ format, timelines, rows, onJump }: SheetSearchPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const open = useSheetSearchStore((state) => state.searchPanelOpen);
  const searchCurrent = useSheetSearchStore((state) => state.searchCurrent);
  const searchHits = useSheetSearchStore((state) => state.searchHits);
  const errorSearchActive = useSheetSearchStore((state) => state.errorSearchActive);
  const runSearch = useSheetSearchStore((state) => state.runSearch);
  const searchStep = useSheetSearchStore((state) => state.searchStep);
  const toggleSearchPanel = useSheetSearchStore((state) => state.toggleSearchPanel);
  const toggleErrorSearch = useSheetSearchStore((state) => state.toggleErrorSearch);
  const setSearchInputFocused = useSheetSearchStore((state) => state.setSearchInputFocused);
  const canPrev = useSheetSearchStore((state) => state.canSearchPrev());
  const canNext = useSheetSearchStore((state) => state.canSearchNext());

  const errorCount = countErrorRows(rows);

  // 열릴 때 input focus — 버튼·`/` 단축키 공용
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    // 체크 시 input 비움 (`/` searchInput.value='' parity)
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
        aria-label="자막 검색"
        onClick={handleToggle}
      >
        검색
      </Button>
      {open ? (
        <form
          className="flex flex-wrap items-center gap-2"
          aria-label="시트 검색"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            type="search"
            name="sheet-search"
            aria-label="검색어"
            placeholder="검색어"
            className="h-8 w-52"
            disabled={errorSearchActive}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            aria-label="찾기"
            disabled={errorSearchActive}
          >
            찾기
          </Button>
          <label className="flex items-center gap-1 text-sm" htmlFor="sheet-error-search">
            <input
              id="sheet-error-search"
              type="checkbox"
              aria-label="오류 찾기"
              checked={errorSearchActive}
              onChange={handleErrorSearchChange}
            />
            <span aria-live="polite">
              {errorCount > 0 ? `${errorCount}건의 오류` : '오류 없음'}
            </span>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="이전 매치"
            disabled={!canPrev}
            onClick={handlePrev}
          >
            이전
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="다음 매치"
            disabled={!canNext}
            onClick={handleNext}
          >
            다음
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
