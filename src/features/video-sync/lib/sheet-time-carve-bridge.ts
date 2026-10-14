import type { Fn } from '@/shared/types/fn';

let sheetTimeCarveHandler: Fn<void> | null = null;

/** 시트가 등록 — 비디오 「시간 입력」·Ctrl+` 공용 */
const registerSheetTimeCarveHandler = (handler: Fn<void> | null) => {
  sheetTimeCarveHandler = handler;
};

const requestSheetTimeCarve = () => {
  sheetTimeCarveHandler?.();
};

export { registerSheetTimeCarveHandler, requestSheetTimeCarve };
