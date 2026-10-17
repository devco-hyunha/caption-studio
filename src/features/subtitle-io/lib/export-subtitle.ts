import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SubtitleTimeline } from '@/shared/types/subtitle-timeline';
import {
  buildExcel,
  DEFAULT_ENCODING,
  encodeText,
  formatExportData,
  serializeJsonWorkbook,
  serializeSmi,
  serializeSrt,
  serializeVtt,
} from '@/entities/subtitle';
import { downloadBytes } from './download-bytes';
import { toSubtitleTimelines } from './to-subtitle-timeline';
import type { BuiltExportFile, ExportSubtitleOptions, ExportWorkbookTab } from '../types';

/** 기본명 `caption` + 확장자 무조건 append */
const buildFilename = (filename: string, exportFormat: SubtitleExportFormat) => {
  const name = filename.trim() || 'caption';
  const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat;
  return `${name}.${extension}`;
};

const resolveWorkbookTabs = (options: ExportSubtitleOptions): ExportWorkbookTab[] => {
  if (options.workbookTabs?.length) {
    return options.workbookTabs.map((tab) => ({
      name: tab.name,
      timelines: tab.timelines,
    }));
  }
  return [{ name: 'Sheet1', timelines: options.timelines }];
};

const buildJsonWorkbookPayload = (
  options: ExportSubtitleOptions,
  dataFormat: SubtitleFormat,
): string => {
  const tabs = resolveWorkbookTabs(options);
  const sheets = tabs.map((tab) => ({
    name: tab.name,
    timelines: formatExportData({
      exportFormat: 'json',
      sheetFormat: options.sheetFormat,
      sheetData: toSubtitleTimelines(tab.timelines),
      dataFormat,
    }),
  }));
  return serializeJsonWorkbook({ sheets });
};

const serializePayload = (
  exportFormat: SubtitleExportFormat,
  exportData: SubtitleTimeline[],
  removeStyle: boolean,
): string => {
  if (exportFormat === 'smi') return serializeSmi(exportData);
  if (exportFormat === 'vtt') {
    return serializeVtt(exportData, { removeStyle });
  }
  return serializeSrt(exportData, { removeStyle });
};

/** 시트 → serialize → encode (다운로드 없음 · Vitest용) */
const buildExportFile = (options: ExportSubtitleOptions): BuiltExportFile => {
  const dataFormat = options.dataFormat ?? options.sheetFormat;

  if (options.exportFormat === 'excel') {
    const tabs = resolveWorkbookTabs(options).map((tab) => ({
      name: tab.name,
      timelines: toSubtitleTimelines(tab.timelines),
    }));
    const bytes = buildExcel({
      sheetFormat: options.sheetFormat,
      columnFormat: dataFormat,
      tabs,
    });
    return {
      filename: buildFilename(options.filename, 'excel'),
      bytes,
      payload: '',
    };
  }

  if (options.exportFormat === 'json') {
    const payload = buildJsonWorkbookPayload(options, dataFormat);
    return {
      filename: buildFilename(options.filename, 'json'),
      bytes: encodeText(payload, DEFAULT_ENCODING),
      payload,
    };
  }

  const sheetData = toSubtitleTimelines(options.timelines);
  const exportData = formatExportData({
    exportFormat: options.exportFormat,
    sheetFormat: options.sheetFormat,
    sheetData,
  });

  const removeStyle =
    options.exportFormat === 'srt' || options.exportFormat === 'vtt'
      ? options.removeStyle === true
      : false;

  const payload = serializePayload(options.exportFormat, exportData, removeStyle);

  const encoding = options.exportFormat === 'smi' ? options.encoding : DEFAULT_ENCODING;

  return {
    filename: buildFilename(options.filename, options.exportFormat),
    bytes: encodeText(payload, encoding),
    payload,
  };
};

/** 시트 → serialize → encode → 다운로드 */
const exportSubtitleFile = (options: ExportSubtitleOptions) => {
  const built = buildExportFile(options);
  downloadBytes(built.filename, built.bytes);
};

export { buildExportFile, buildFilename, exportSubtitleFile };
