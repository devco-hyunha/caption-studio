import { cloneTimeline, type SheetTimelineItem } from '@/entities/subtitle-sheet';

/** `/` sheet.config.jump 기본값 (ms) */
const DEFAULT_TIME_JUMP_MS = 30;

/** `/` `storage` 키 `jump_val` — 하이브리드 공유 */
const STORAGE_KEY_JUMP = 'jump_val';

type TimelineNudgeMode = 'start' | 'end' | 'both';

/** jump 스텝(ms). 없거나 잘못된 값이면 기본 30 */
const readTimeJumpMs = (): number => {
	if (typeof window === 'undefined') return DEFAULT_TIME_JUMP_MS;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY_JUMP);
		if (raw == null) return DEFAULT_TIME_JUMP_MS;
		const parsed: unknown = JSON.parse(raw);
		const value = Number.parseInt(String(parsed), 10);
		if (!Number.isFinite(value) || value <= 0) return DEFAULT_TIME_JUMP_MS;
		return value;
	} catch {
		return DEFAULT_TIME_JUMP_MS;
	}
};

const applyTimeJumpStep = (
	value: number | undefined,
	direction: 1 | -1,
	step: number,
) => {
	const base = typeof value === 'number' && Number.isFinite(value) ? value : 0;
	return Math.max(0, base + direction * step);
};

/** start/end(또는 둘 다)에 jump 스텝 적용 */
const nudgeTimelineByStep = (
	timeline: SheetTimelineItem,
	direction: 1 | -1,
	step: number,
	mode: TimelineNudgeMode,
): SheetTimelineItem => {
	const next = cloneTimeline(timeline);
	if (mode === 'start' || mode === 'both') {
		next.start = applyTimeJumpStep(next.start, direction, step);
	}
	if (mode === 'end' || mode === 'both') {
		next.end = applyTimeJumpStep(next.end, direction, step);
	}
	return next;
};

export {
	DEFAULT_TIME_JUMP_MS,
	STORAGE_KEY_JUMP,
	nudgeTimelineByStep,
	readTimeJumpMs,
};
export type { TimelineNudgeMode };
