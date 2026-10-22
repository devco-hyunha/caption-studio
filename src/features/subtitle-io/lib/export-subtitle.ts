import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import {
  buildExcel,
  DEFAULT_ENCODING,
  encodeText,
  formatExportData,
  serializeJsonWorkbook,
} from '@/entities/subtitle';
import { toUpperFormat } from '@/shared/lib/format';
import { downloadBytes } from './download-bytes';
import { toSubtitleTimelines } from './to-subtitle-timeline';
import { buildSubtitleZip, buildTabPayload } from './build-zip';
import { EXTENSION_BY_FORMAT, ZIP_EXTENSION } from './constants';
import type { BuiltExportFile, ExportSubtitleOptions, ExportWorkbookTab } from '../types';

/** 기본명 `caption` + 확장자 append */
const buildFilename = (filename: string, exportFormat: SubtitleExportFormat | 'zip') => {
  const name = filename.trim() || 'caption';
  const extension =
    exportFormat === 'zip' ? ZIP_EXTENSION : EXTENSION_BY_FORMAT[toUpperFormat(exportFormat)];
  return `${name}.${extension}`;
};

const resolveWorkbookTabs = (options: ExportSubtitleOptions): ExportWorkbookTab[] => {
  if (options.workbookTabs?.length) {
    return options.workbookTabs.map((tab) => ({
      name: tab.name,
      timelines: tab.timelines,
      smiName: tab.smiName,
      smiLang: tab.smiLang,
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

const exportEncoding = (exportFormat: SubtitleExportFormat, encoding: string) =>
  exportFormat === 'smi' ? encoding : DEFAULT_ENCODING;

const resolveRemoveStyle = (exportFormat: SubtitleExportFormat, removeStyle?: boolean) =>
  exportFormat === 'srt' || exportFormat === 'vtt' ? removeStyle === true : false;

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

  const locale = options.locale ?? 'ko';
  const removeStyle = resolveRemoveStyle(options.exportFormat, options.removeStyle);
  const encoding = exportEncoding(options.exportFormat, options.encoding);

  const tabs =
    options.selectedTabs && options.selectedTabs.length > 0
      ? options.selectedTabs
      : [{ name: 'Sheet1', timelines: options.timelines }];

  if (tabs.length > 1) {
    const bytes = buildSubtitleZip(tabs, {
      exportFormat: options.exportFormat,
      sheetFormat: options.sheetFormat,
      locale,
      encoding,
      removeStyle,
    });
    return {
      filename: buildFilename(options.filename, 'zip'),
      bytes,
      payload: '',
    };
  }

  const payload = buildTabPayload(
    options.exportFormat,
    options.sheetFormat,
    tabs[0],
    locale,
    removeStyle,
  );

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
