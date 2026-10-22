/** 시트·import·export 공통 자막 포맷 */
export type SubtitleFormat = 'smi' | 'srt';

/** 내보내기 파일 포맷 */
export type SubtitleExportFormat = 'smi' | 'srt' | 'vtt' | 'json' | 'excel';

/** 포맷 대문자 키 — EXTENSION_BY_FORMAT·ENCODING_KEY_BY_FORMAT lookup 키 */
export type SubtitleFormatUpper = Uppercase<SubtitleFormat>;

/** 내보내기 포맷 대문자 키 */
export type SubtitleExportFormatUpper = Uppercase<SubtitleExportFormat>;
