import { useMemo } from 'react';
import { useVideoSyncStore } from '../model/use-video-sync-store';

/**
 * 재생 시각 활성 행 index 집합 — activeIndices(store) → Set.
 * 시트 행 highlight·오버레이가 소비. 동일 indices면 Set 재생성 안 함(useMemo).
 */
const usePlaybackSet = (): ReadonlySet<number> => {
  const activeIndices = useVideoSyncStore((state) => state.activeIndices);
  return useMemo(() => new Set(activeIndices), [activeIndices]);
};

export { usePlaybackSet };
