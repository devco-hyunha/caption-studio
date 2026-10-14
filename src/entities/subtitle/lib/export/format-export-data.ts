import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SubtitleTimeline } from '@/shared/types/subtitle-timeline';
import { formatTime } from '@/shared/lib/timecode';
import { converters } from '../parse/convert';
import type { FormatExportDataOptions } from '../../types';

/** export 포맷 → 변환 목표 시트 포맷 */
const resolveConvertTarget = (
  exportFormat: SubtitleExportFormat,
  sheetFormat: SubtitleFormat,
  dataFormat?: SubtitleFormat,
): SubtitleFormat => {
  if (exportFormat === 'vtt') return 'srt';
  if (exportFormat === 'json' || exportFormat === 'excel') {
    return dataFormat ?? sheetFormat;
  }
  return exportFormat;
};

/**
 * 시트 → export용 타임라인 (starttime/endtime 채움).
 * VTT는 내부적으로 srt 변환, JSON은 dataFormat(smi|srt) 배열.
 */
const formatExportData = ({
  exportFormat,
  sheetFormat,
  sheetData,
  dataFormat,
}: FormatExportDataOptions): SubtitleTimeline[] => {
  const convertTarget = resolveConvertTarget(exportFormat, sheetFormat, dataFormat);

  const timelines =
    sheetFormat !== convertTarget
      ? converters[convertTarget](sheetFormat, sheetData).timelines
      : [...sheetData];

  if (convertTarget === 'srt' || sheetFormat === 'srt') {
    return timelines.map(({ start, end, text, memo = '' }) => ({
      start,
      starttime: formatTime(start),
      end,
      endtime: formatTime(end ?? 0),
      text,
      memo,
    }));
  }

  if (sheetFormat === 'smi' || convertTarget === 'smi') {
    return timelines.map(({ start, text, memo = '' }) => ({
      start,
      starttime: formatTime(start),
      text,
      memo,
    }));
  }

  return [];
};

export { formatExportData, resolveConvertTarget };
