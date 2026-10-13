import type { SheetTimeCarveHandler } from '../types';

let sheetTimeCarveHandler: SheetTimeCarveHandler | null = null;

/** 시트가 등록 — 비디오 「시간 입력」·Ctrl+` 공용 */
const registerSheetTimeCarveHandler = (handler: SheetTimeCarveHandler | null) => {
  sheetTimeCarveHandler = handler;
};

const requestSheetTimeCarve = () => {
  sheetTimeCarveHandler?.();
};

export { registerSheetTimeCarveHandler, requestSheetTimeCarve };
