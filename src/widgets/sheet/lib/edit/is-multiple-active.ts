import { useSheetStore } from '@/entities/subtitle-sheet';

/** multiple 모드 — 클릭/에딧 진입 금지 */
const isMultipleActive = () => {
	const { active, sheets } = useSheetStore.getState();
	return sheets[active]?.multipleActive === true;
};

export { isMultipleActive };
