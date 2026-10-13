/** 시트/변환용 타임라인 행 */
export interface SubtitleTimeline {
  start: number;
  end?: number;
  starttime?: string;
  endtime?: string;
  text: string;
  memo: string;
}

/** 시트 저장 포맷 */
export type SubtitleFormat = 'smi' | 'srt';

/** 내보내기 파일 포맷 */
export type SubtitleExportFormat = 'smi' | 'srt' | 'vtt' | 'json' | 'excel';

/** parse / convert 결과 */
export interface SubtitleSheetData {
  format: SubtitleFormat;
  timelines: SubtitleTimeline[];
}

/** SMI 직렬화 옵션 (폼 없이 Verify용) */
export interface SerializeSmiOptions {
  classKey?: string;
  classStyle?: string;
  signature?: string;
  title?: string;
}

/** SRT 직렬화 옵션 */
export interface SerializeSrtOptions {
  /** 스타일 태그 제거 */
  removeStyle?: boolean;
}

/** VTT 직렬화 옵션 */
export interface SerializeVttOptions {
  removeStyle?: boolean;
}

/** parse — SRT cue 누적 draft */
export interface SrtParseDraft {
  id?: string;
  start?: string;
  end?: string;
  text: string;
}

/** convert — 입력 형태 (파일 문자열 포함) */
export type ConvertInputFormat = 'smistring' | 'srtstring' | 'smi' | 'srt' | 'string';

/** SRT/VTT 공통 timed cue 옵션 */
export interface BuildTimedCuesOptions {
  useDotDecimal: boolean;
  shouldRemoveStyle: boolean;
}

/** export 시트 → export 타임라인 변환 옵션 */
export interface FormatExportDataOptions {
  exportFormat: SubtitleExportFormat;
  sheetFormat: SubtitleFormat;
  sheetData: readonly SubtitleTimeline[];
  /**
   * JSON 내보내기 시 배열 형태 (smi|srt).
   * vtt는 항상 srt 변환.
   */
  dataFormat?: SubtitleFormat;
}

/** JSON 직렬화 — 단일 시트 */
export interface SubtitleJsonSheet {
  name: string;
  timelines: SubtitleTimeline[];
}

/** JSON 직렬화 — 자막 탭 전체 */
export interface SubtitleJsonWorkbook {
  sheets: SubtitleJsonSheet[];
}

/** ZIP(STORE) 엔트리 — xlsx(OPC)용 */
export interface ZipEntry {
  name: string;
  content: string | Uint8Array;
}

/** Excel 워크북 탭 */
export interface ExcelWorkbookTab {
  name: string;
  timelines: readonly SubtitleTimeline[];
}

/** xlsx 빌드 옵션 */
export interface BuildExcelOptions {
  sheetFormat: SubtitleFormat;
  columnFormat: SubtitleFormat;
  tabs: readonly ExcelWorkbookTab[];
}

/** encodeHtml 옵션 */
export interface EncodeHtmlOptions {
  /** 원본 DOM을 복제해서 변형하지 않는다 */
  clone?: boolean;
  /** `font`: color→`<font color>` 변환. `keep`: color 속성 보존 */
  colorMode?: 'font' | 'keep';
}
