import { clamp } from '@/shared/lib/number';
import { getVideoPlayerControlApi } from './player-bridge';

/** Ctrl+Space — 재생/일시정지 */
const toggleVideoPlayback = (): boolean => {
  const api = getVideoPlayerControlApi();
  if (!api) return false;
  api.toggle();
  return true;
};

/** Ctrl+←/→ — 현재 시각 ±delta초 seek */
const seekVideoBySeconds = (deltaSeconds: number): boolean => {
  const api = getVideoPlayerControlApi();
  if (!api) return false;
  const current = api.getCurrentTime();
  if (!Number.isFinite(current) || !Number.isFinite(deltaSeconds)) return false;
  return api.seekTo(Math.max(0, current + deltaSeconds));
};

/** Ctrl+↑/↓ — 볼륨 ±delta (0~1 clamp) */
const adjustVideoVolume = (delta: number): boolean => {
  const api = getVideoPlayerControlApi();
  if (!api) return false;
  const current = api.getVolume();
  if (!Number.isFinite(current) || !Number.isFinite(delta)) return false;
  api.setVolume(clamp(current + delta, 0, 1));
  return true;
};

export { adjustVideoVolume, seekVideoBySeconds, toggleVideoPlayback };
