import { useSheetStore } from '@/entities/subtitle-sheet';

/** 활성 탭 timelines — video-sync 전역 보조 (seek·슬롯 동기화 공용) */
const readActiveTimelines = () => {
  const { sheets, active } = useSheetStore.getState();
  return sheets[active]?.timelines ?? [];
};

export { readActiveTimelines };
