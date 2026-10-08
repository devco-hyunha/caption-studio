import { getVideoPlayerControlApi } from './player-bridge';

const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

const toggleVideoPlayback = (): boolean => {
	const api = getVideoPlayerControlApi();
	if (!api) return false;
	api.toggle();
	return true;
};

const seekVideoBySeconds = (deltaSeconds: number): boolean => {
	const api = getVideoPlayerControlApi();
	if (!api) return false;
	const current = api.getCurrentTime();
	if (!Number.isFinite(current) || !Number.isFinite(deltaSeconds)) return false;
	return api.seekTo(Math.max(0, current + deltaSeconds));
};

const adjustVideoVolume = (delta: number): boolean => {
	const api = getVideoPlayerControlApi();
	if (!api) return false;
	const current = api.getVolume();
	if (!Number.isFinite(current) || !Number.isFinite(delta)) return false;
	api.setVolume(clampVolume(current + delta));
	return true;
};

export { adjustVideoVolume, seekVideoBySeconds, toggleVideoPlayback };
