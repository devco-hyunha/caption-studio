import { timeSearchAll, useSheetStore } from '@/entities/subtitle-sheet';
import { useVideoSyncStore } from '../model/use-video-sync-store';

const sameIndices = (left: readonly number[], right: readonly number[]) => {
	if (left.length !== right.length) return false;
	for (let index = 0; index < left.length; index += 1) {
		if (left[index] !== right[index]) return false;
	}
	return true;
};

/**
 * 플레이어 시각(초) → 활성 행 indices.
 * 동일하면 no-op (루프·불필요 리렌더 방지).
 */
const syncPlaybackFromPlayerTime = (seconds: number) => {
	if (!Number.isFinite(seconds)) return;

	const ms = Math.trunc(seconds * 1000);
	const { sheets, active } = useSheetStore.getState();
	const timelines = sheets[active]?.timelines ?? [];
	const { timeSlots, activeIndices, setActiveIndices } = useVideoSyncStore.getState();
	const { indices } = timeSearchAll(timelines, ms, timeSlots);

	if (sameIndices(indices, activeIndices)) return;
	setActiveIndices(indices);
};

export { sameIndices, syncPlaybackFromPlayerTime };
