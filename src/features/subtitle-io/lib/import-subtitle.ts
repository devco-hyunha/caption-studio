import type { SubtitleFormat } from '@/shared/types/subtitle-format';
import { converters, parseSubtitleFile } from '@/entities/subtitle';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { readFileText } from './read-file';
import type { ImportSubtitleResult } from '../types';

const EXTENSION_PATTERN: Record<SubtitleFormat, RegExp> = {
  smi: /^smi$/i,
  srt: /^srt$/i,
};

const detectFileFormat = (filename: string): SubtitleFormat | null => {
  const ext = filename.split('.').pop() ?? '';
  if (EXTENSION_PATTERN.smi.test(ext)) return 'smi';
  if (EXTENSION_PATTERN.srt.test(ext)) return 'srt';
  return null;
};

/** 디코딩된 문자열 → 시트 타임라인 (순수 · Vitest용) */
const importSubtitleText = (
  text: string,
  fileFormat: SubtitleFormat,
  sheetFormat: SubtitleFormat,
): ImportSubtitleResult => {
  const parsed = parseSubtitleFile(fileFormat, text, sheetFormat);
  const timelines: SheetTimelineItem[] = parsed.timelines.map((item) => ({
    start: item.start,
    end: item.end,
    text: item.text,
    memo: item.memo,
  }));
  return { format: parsed.format, timelines };
};

/**
 * FileReader.readAsText → parse.
 * 활성 탭 교체는 호출측에서 `setActiveTimelines`.
 */
const importSubtitleFile = async (
  file: File,
  sheetFormat: SubtitleFormat,
  encoding: string,
): Promise<ImportSubtitleResult> => {
  const fileFormat = detectFileFormat(file.name);
  if (!fileFormat) {
    throw new Error('not-support-file-format');
  }

  const text = await readFileText(file, encoding);
  return importSubtitleText(text, fileFormat, sheetFormat);
};

/** 자막 텍스트 입력 → 활성 시트 포맷 타임라인 */
const importSheetText = (sheetFormat: SubtitleFormat, text: string): ImportSubtitleResult => {
  const converted = converters[sheetFormat]('string', text);
  const timelines: SheetTimelineItem[] = converted.timelines.map((item) => ({
    start: item.start,
    end: item.end,
    text: item.text,
    memo: item.memo,
  }));
  return { format: converted.format, timelines };
};

export { detectFileFormat, importSheetText, importSubtitleFile, importSubtitleText };
