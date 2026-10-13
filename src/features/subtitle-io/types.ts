import type { SubtitleExportFormat, SubtitleFormat } from '@/entities/subtitle';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

export type SubtitleIoFormat = SubtitleFormat;
export type SubtitleIoExportFormat = SubtitleExportFormat;

export interface ImportSubtitleResult {
  format: SubtitleIoFormat;
  timelines: SheetTimelineItem[];
}

export interface ExportWorkbookTab {
  name: string;
  timelines: readonly SheetTimelineItem[];
}

/** 시트 → serialize → encode 결과 (테스트·디버그용) */
export interface BuiltExportFile {
  filename: string;
  bytes: Uint8Array;
  /** encode 전 문자열. excel은 빈 문자열 */
  payload: string;
}

export interface SubtitleIoPanelProps {
  /** 현재 UI 시트 포맷 (import 변환 목표 · export 기본) */
  sheetFormat: SubtitleFormat;
  timelines: readonly SheetTimelineItem[];
  /** json/excel — 자막 탭 전체 */
  workbookTabs: readonly ExportWorkbookTab[];
  onImported: (timelines: SheetTimelineItem[]) => void;
}

export interface ExportSubtitleOptions {
  sheetFormat: SubtitleIoFormat;
  exportFormat: SubtitleIoExportFormat;
  /** 활성 탭 (smi/srt/vtt) */
  timelines: readonly SheetTimelineItem[];
  /** json/excel — 자막 탭 전체 */
  workbookTabs?: readonly ExportWorkbookTab[];
  encoding: string;
  filename: string;
  /** SRT/VTT 스타일 제거 */
  removeStyle?: boolean;
  /** JSON/Excel 열·배열 형태 smi|srt */
  dataFormat?: SubtitleFormat;
}
