import { cloneTimeline } from '@/entities/subtitle-sheet';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

/** time ±jump — 기본값 30ms. localStorage `jump_val`과 하이브리드 공유 */
const DEFAULT_JUMP_MS = 30;
const STORAGE_KEY_JUMP = 'jump_val';

/** `jump_val`은 JSON.parse — 문자열/숫자 모두 parseInt. corrupt는 기본값 */
const readTimeJumpMs = (): number => {
  if (typeof window === 'undefined') return DEFAULT_JUMP_MS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_JUMP);
    if (raw == null || raw === '') return DEFAULT_JUMP_MS;
    const parsed = Number.parseInt(String(JSON.parse(raw)), 10);
    return Number.isFinite(parsed) ? parsed : DEFAULT_JUMP_MS;
  } catch {
    return DEFAULT_JUMP_MS;
  }
};

const clampTime = (value: number) => Math.max(0, value);

/** 다중 선택 nudge — 선택 행 start/end **둘 다** ±step. end는 truth일 때만 */
const nudgeTimelineByStep = (
  timeline: SheetTimelineItem,
  step: number,
  direction: 'plus' | 'minus',
): SheetTimelineItem => {
  const next = cloneTimeline(timeline);

  if (direction === 'plus') {
    next.start = (next.start ?? 0) + step;
    if (next.end) next.end = next.end + step;
    return next;
  }

  next.start = clampTime((next.start ?? 0) - step);
  if (next.end) next.end = clampTime(next.end - step);
  return next;
};

/** 단건 nudge — 포커스된 time 열(starttime/endtime)만 ±step. minus는 값이 0이면 변화 없음 */
const nudgeTimelineColumn = (
  timeline: SheetTimelineItem,
  column: 'starttime' | 'endtime',
  step: number,
  direction: 'plus' | 'minus',
): SheetTimelineItem => {
  const next = cloneTimeline(timeline);
  const field = column === 'starttime' ? 'start' : 'end';
  const current = next[field] ?? 0;

  if (direction === 'plus') {
    next[field] = current + step;
    return next;
  }

  if (current > 0) next[field] = clampTime(current - step);
  return next;
};

export { DEFAULT_JUMP_MS, nudgeTimelineByStep, nudgeTimelineColumn, readTimeJumpMs };
