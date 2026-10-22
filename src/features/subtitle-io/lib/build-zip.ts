import {
  encodeText,
  formatExportData,
  formatSmiClassStyle,
  localeSmiPreset,
  sanitizeSheetTabName,
  serializeSmi,
  serializeSrt,
  serializeVtt,
  zipStore,
} from '@/entities/subtitle';
import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import type { Locale } from '@/shared/types/locale';
import { toUpperFormat } from '@/shared/lib/format';
import { EXTENSION_BY_FORMAT } from './constants';
import { toSubtitleTimelines } from './to-subtitle-timeline';
import type { ZipEntry } from '@/entities/subtitle';
import type { ExportWorkbookTab } from '../types';

/** 탭 SMI 메타 → Class 프리셋. 비우면 로케일 프리셋 */
const resolveSmiClass = (tab: ExportWorkbookTab, locale: Locale) => {
  const preset = localeSmiPreset(locale);
  const name = tab.smiName?.trim() || preset.name;
  const lang = tab.smiLang?.trim() || preset.lang;
  return { classKey: preset.classKey, classStyle: formatSmiClassStyle(name, lang) };
};

/** 선택 탭 → 포맷별 직렬화 문자열 */
const buildTabPayload = (
  exportFormat: SubtitleExportFormat,
  sheetFormat: SubtitleFormat,
  tab: ExportWorkbookTab,
  locale: Locale,
  removeStyle: boolean,
): string => {
  const exportData = formatExportData({
    exportFormat,
    sheetFormat,
    sheetData: toSubtitleTimelines(tab.timelines),
  });

  if (exportFormat === 'smi') {
    const { classKey, classStyle } = resolveSmiClass(tab, locale);
    return serializeSmi(exportData, { classKey, classStyle });
  }
  if (exportFormat === 'vtt') {
    return serializeVtt(exportData, { removeStyle });
  }
  return serializeSrt(exportData, { removeStyle });
};

/** 탭 이름 → zip 내 파일명. 겹치면 순번 접미 (`.ext`는 보존) */
const entryName = (tab: ExportWorkbookTab, index: number, exportFormat: SubtitleExportFormat) => {
  const base = sanitizeSheetTabName(tab.name, index);
  const ext = EXTENSION_BY_FORMAT[toUpperFormat(exportFormat)];
  return `${base}.${ext}`;
};

/** 다중 탭 → zip 엔트리. 파일명 충돌은 순번 접미로 구분 */
const buildSubtitleZip = (
  tabs: readonly ExportWorkbookTab[],
  opts: {
    exportFormat: SubtitleExportFormat;
    sheetFormat: SubtitleFormat;
    locale: Locale;
    encoding: string;
    removeStyle: boolean;
  },
): Uint8Array => {
  const used = new Set<string>();
  const entries: ZipEntry[] = tabs.map((tab, index) => {
    const payload = buildTabPayload(
      opts.exportFormat,
      opts.sheetFormat,
      tab,
      opts.locale,
      opts.removeStyle,
    );
    const base = entryName(tab, index, opts.exportFormat);
    const name = used.has(base) ? `${base}-${index + 1}` : base;
    used.add(name);
    return { name, content: encodeText(payload, opts.encoding) };
  });

  return zipStore(entries);
};

export { buildSubtitleZip, buildTabPayload, entryName };
