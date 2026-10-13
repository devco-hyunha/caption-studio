import type { SubtitleJsonWorkbook, SubtitleTimeline } from '../../types';

/** 단일 탭 timelines (호환·단일 export) */
const serializeJson = (data: readonly SubtitleTimeline[]): string =>
  JSON.stringify(data, null, '\t');

/** 자막 탭 전체 */
const serializeJsonWorkbook = (workbook: SubtitleJsonWorkbook): string =>
  JSON.stringify(workbook, null, '\t');

export { serializeJson, serializeJsonWorkbook };
