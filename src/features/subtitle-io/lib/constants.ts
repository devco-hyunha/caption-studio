import type {
  SubtitleExportFormat,
  SubtitleExportFormatUpper,
} from '@/shared/types/subtitle-format';
import type { EncodingKey } from '../types';

/** 내보내기 형식 선택 목록 (UI value는 소문자 유지) */
const EXPORT_FORMATS: readonly SubtitleExportFormat[] = ['smi', 'srt', 'vtt', 'json', 'excel'];

/** export 포맷(대문자 키) → 파일 확장자. 값은 소문자 유지 */
const EXTENSION_BY_FORMAT: Record<SubtitleExportFormatUpper, string> = {
  SMI: 'smi',
  SRT: 'srt',
  VTT: 'vtt',
  JSON: 'json',
  EXCEL: 'xlsx',
};

/** export 포맷(대문자 키) → 인코딩 영속 키. 값은 localStorage 키 그대로. json/excel은 없음 */
const ENCODING_KEY_BY_FORMAT: Partial<Record<SubtitleExportFormatUpper, EncodingKey>> = {
  SMI: 'smiEncodeFile',
  SRT: 'srtEncodeFile',
  VTT: 'vttEncodeFile',
};

/** 다중 탭 내보내기 아카이브 확장자 */
const ZIP_EXTENSION = 'zip';

export { ENCODING_KEY_BY_FORMAT, EXPORT_FORMATS, EXTENSION_BY_FORMAT, ZIP_EXTENSION };
