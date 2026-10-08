import type { FormEvent } from 'react';
import { useRef } from 'react';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { Button } from '@/shared/ui/button';
import { useSheetSessionStore } from '../model/use-sheet-session-store';
import type { SearchHit, SheetSessionFormat } from '../types';

export interface SheetSearchPanelProps {
	format: SheetSessionFormat;
	timelines: readonly SheetTimelineItem[];
	onJump: (hit: SearchHit) => void;
}

/**
 * Verify용 최소 검색 패널 — 쿼리 · prev/next · 건수.
 * 풀 검색 셸(i18n/툴바)은 후속.
 */
const SheetSearchPanel = ({ format, timelines, onJump }: SheetSearchPanelProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const open = useSheetSessionStore((state) => state.searchPanelOpen);
	const searchCurrent = useSheetSessionStore((state) => state.searchCurrent);
	const searchHits = useSheetSessionStore((state) => state.searchHits);
	const runSearch = useSheetSessionStore((state) => state.runSearch);
	const searchStep = useSheetSessionStore((state) => state.searchStep);
	const toggleSearchPanel = useSheetSessionStore((state) => state.toggleSearchPanel);
	const setSearchInputFocused = useSheetSessionStore(
		(state) => state.setSearchInputFocused,
	);
	const canPrev = searchHits.length > 0 && searchCurrent > 0;
	const canNext =
		searchHits.length > 0 && searchCurrent >= 0 && searchCurrent < searchHits.length - 1;

	const handleToggle = () => {
		const nextOpen = !open;
		toggleSearchPanel();
		if (nextOpen) {
			setTimeout(() => inputRef.current?.focus(), 0);
		}
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

	const resultLabel =
		searchHits.length > 0 ? `${searchCurrent + 1}/${searchHits.length}` : '0/0';

	return (
		<div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
			<Button
				type="button"
				size="sm"
				variant={open ? 'default' : 'outline'}
				aria-pressed={open}
				aria-label="Toggle sheet search"
				onClick={handleToggle}
			>
				검색
			</Button>
			{open ? (
				<form
					className="flex flex-wrap items-center gap-2"
					aria-label="Sheet search"
					onSubmit={handleSubmit}
				>
					<input
						ref={inputRef}
						type="search"
						name="sheet-search"
						aria-label="Search query"
						placeholder="검색어"
						className="border-input bg-background h-8 rounded-md border px-2 text-sm"
						onFocus={handleSearchFocus}
						onBlur={handleSearchBlur}
					/>
					<Button type="submit" size="sm" variant="outline" aria-label="Run search">
						찾기
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						aria-label="Previous match"
						disabled={!canPrev}
						onClick={handlePrev}
					>
						이전
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						aria-label="Next match"
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
