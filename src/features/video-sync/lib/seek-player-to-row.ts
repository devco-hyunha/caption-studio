import {
  findNextStartNeighborIndex,
  findPrevStartNeighborIndex,
  resolveStartMs,
  type SheetTimelineItem,
} from '@/entities/subtitle-sheet';
import { secondsToMs } from '@/shared/lib/timecode';
import { getVideoPlayerControlApi } from './player-bridge';
import { readActiveTimelines } from './read-active-timelines';
import { useVideoSyncStore } from '../model/use-video-sync-store';

const resolvePlaybackMs = (): number => {
  const api = getVideoPlayerControlApi();
  if (!api) return 0;
  return secondsToMs(api.getCurrentTime());
};

/**
 * Prev/Next 기준 시각.
 * - 출력 중 자막 있으면: Prev=min start, Next=max start
 * - 없으면: 플레이어 현재 시각
 */
const resolveNeighborFromMs = (
  timelines: readonly SheetTimelineItem[],
  activeIndices: readonly number[],
  direction: 'prev' | 'next',
): number => {
  if (activeIndices.length === 0) return resolvePlaybackMs();

  let minStartMs = Number.POSITIVE_INFINITY;
  let maxStartMs = Number.NEGATIVE_INFINITY;

  for (const rowIndex of activeIndices) {
    const startMs = resolveStartMs(timelines[rowIndex]);
    if (startMs == null) continue;
    if (startMs < minStartMs) minStartMs = startMs;
    if (startMs > maxStartMs) maxStartMs = startMs;
  }

  if (!Number.isFinite(minStartMs) || !Number.isFinite(maxStartMs)) {
    return resolvePlaybackMs();
  }

  return direction === 'prev' ? minStartMs : maxStartMs;
};

/**
 * 행 start(ms) → 플레이어 seek(초).
 * 활성 indices는 seek 성공 시 `syncPlaybackFromPlayerTime`이 다중 cue로 맞춤.
 */
const seekPlayerToRowIndex = (rowIndex: number): boolean => {
  if (!Number.isInteger(rowIndex) || rowIndex < 0) return false;

  const api = getVideoPlayerControlApi();
  if (!api) return false;

  const startMs = resolveStartMs(readActiveTimelines()[rowIndex]);
  if (startMs == null) return false;

  return api.seekTo(Math.max(0, startMs / 1000));
};

/**
 * 이전 start 이웃으로 seek.
 * 기준 = 출력 자막 min start (없으면 재생 시각). 분 슬롯 탐색.
 */
const seekPlayerToPrevCue = (): boolean => {
  const timelines = readActiveTimelines();
  if (timelines.length === 0) return false;

  const { timeSlots, activeIndices } = useVideoSyncStore.getState();
  const fromMs = resolveNeighborFromMs(timelines, activeIndices, 'prev');
  const rowIndex = findPrevStartNeighborIndex(timelines, fromMs, timeSlots);
  if (rowIndex == null) return false;
  return seekPlayerToRowIndex(rowIndex);
};

/**
 * 다음 start 이웃으로 seek.
 * 기준 = 출력 자막 max start (없으면 재생 시각). 분 슬롯 탐색.
 */
const seekPlayerToNextCue = (): boolean => {
  const timelines = readActiveTimelines();
  if (timelines.length === 0) return false;

  const { timeSlots, activeIndices } = useVideoSyncStore.getState();
  const fromMs = resolveNeighborFromMs(timelines, activeIndices, 'next');
  const rowIndex = findNextStartNeighborIndex(timelines, fromMs, timeSlots);
  if (rowIndex == null) return false;
  return seekPlayerToRowIndex(rowIndex);
};

export { resolveNeighborFromMs, seekPlayerToNextCue, seekPlayerToPrevCue, seekPlayerToRowIndex };
