import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import type { SearchHit, SheetSessionFormat } from '../types';

/** format별 text/memo editable col */
const TEXT_MEMO_COLS: Record<
	SheetSessionFormat,
	{ text: number; memo: number }
> = {
	smi: { text: 1, memo: 2 },
	srt: { text: 2, memo: 3 },
};

/**
 * query(소문자)로 text/memo 매치. 빈 query면 빈 hits.
 */
const findSearchHits = (
	timelines: readonly SheetTimelineItem[],
	query: string,
	format: SheetSessionFormat,
): SearchHit[] => {
	if (!query) return [];

	const cols = TEXT_MEMO_COLS[format];
	const hits: SearchHit[] = [];

	timelines.forEach((timeline, rowIndex) => {
		const text = typeof timeline.text === 'string' ? timeline.text : '';
		const memo = typeof timeline.memo === 'string' ? timeline.memo : '';
		if (text.toLowerCase().search(query) > -1) {
			hits.push({ row: rowIndex, col: cols.text });
		}
		if (memo.toLowerCase().search(query) > -1) {
			hits.push({ row: rowIndex, col: cols.memo });
		}
	});

	return hits;
};

/**
 * 다음/이전 인덱스. hits 없으면 -1.
 */
const stepSearchIndex = (
	current: number,
	hitCount: number,
	direction: 'next' | 'prev',
): number => {
	if (hitCount <= 0) return -1;
	if (direction === 'next') {
		if (current < 0) return 0;
		return Math.min(current + 1, hitCount - 1);
	}
	if (current < 0) return hitCount - 1;
	return Math.max(current - 1, 0);
};

const canSearchPrev = (current: number, hitCount: number): boolean =>
	hitCount > 0 && current > 0;

const canSearchNext = (current: number, hitCount: number): boolean =>
	hitCount > 0 && current >= 0 && current < hitCount - 1;

export {
	TEXT_MEMO_COLS,
	canSearchNext,
	canSearchPrev,
	findSearchHits,
	stepSearchIndex,
};
