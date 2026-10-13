import { useSheetStore } from '@/entities/subtitle-sheet';

/** multiple 모드 — 클릭/에딧 진입 금지. 시트 전역 보조 (edit·selection·mutate 공통) */
const isMultipleActive = () => {
  const { active, sheets } = useSheetStore.getState();
  return sheets[active]?.multipleActive === true;
};

export { isMultipleActive };
