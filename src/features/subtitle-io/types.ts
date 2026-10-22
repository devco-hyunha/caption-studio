import type { RefObject } from 'react';
import type { Locale } from '@/shared/types/locale';
import type { SmiMeta } from '@/shared/types/smi-meta';
import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';

export interface ImportSubtitleResult {
  format: SubtitleFormat;
  timelines: SheetTimelineItem[];
}

/** export 대상 시트 탭 — SMI 메타(shared 정본, 영속 필드) 포함 */
export interface ExportWorkbookTab extends Partial<SmiMeta> {
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

/** import/export 인코딩 영속 키 (localStorage 키 재사용) */
export type EncodingKey =
  'smiEncode' | 'srtEncode' | 'smiEncodeFile' | 'srtEncodeFile' | 'vttEncodeFile';

/** import/export 인코딩 선택 영속 스키마 */
export interface EncodingState {
  smiEncode: string;
  srtEncode: string;
  smiEncodeFile: string;
  srtEncodeFile: string;
  vttEncodeFile: string;
}

/** 영속 스토어 — 상태 + 액션 */
export interface SubtitleIoStore extends EncodingState {
  setEncoding: (key: EncodingKey, value: string) => void;
}

/** export 시트 → serialize → encode 옵션 */
export interface ExportSubtitleOptions {
  sheetFormat: SubtitleFormat;
  exportFormat: SubtitleExportFormat;
  /** 활성 탭 (smi/srt/vtt 단일 파일) */
  timelines: readonly SheetTimelineItem[];
  /** json/excel — 선택 탭 */
  workbookTabs?: readonly ExportWorkbookTab[];
  encoding: string;
  filename: string;
  /** SRT/VTT 스타일 제거 */
  removeStyle?: boolean;
  /** JSON/Excel 열·배열 형태 smi|srt */
  dataFormat?: SubtitleFormat;
  /** 다중 탭 선택 — smi/srt/vtt zip 대상 */
  selectedTabs?: readonly ExportWorkbookTab[];
  /** SMI Class 프리셋 로케일 */
  locale?: Locale;
}

/** 시트 피커 — 체크박스 선택 */
export interface SheetPickerProps {
  /** 탭 이름 목록 */
  names: readonly string[];
  /** 선택 인덱스 */
  selected: readonly number[];
  onChange: (selected: number[]) => void;
}

/** SMI 메타 편집 — 기본 UI ( Name / lang ). onChange는 병합된 완전 메타 */
export interface SmiMetaFieldsProps {
  meta: SmiMeta;
  onChange: (meta: SmiMeta) => void;
}

/** 모달 공통 props — DialogShell 열림 + 시트 데이터 */
export interface SubtitleImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetFormat: SubtitleFormat;
  /** import — 활성 탭 timelines 교체 */
  onImported: (timelines: SheetTimelineItem[]) => void;
  prevFocusRef: RefObject<HTMLElement | null>;
}

export interface SubtitleExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetFormat: SubtitleFormat;
  /** 활성 탭 */
  timelines: readonly SheetTimelineItem[];
  /** 전체 탭 (SMI 메타 포함) */
  workbookTabs: readonly ExportWorkbookTab[];
  activeIndex: number;
  /** SMI 메타 편집 — 활성 탭 영속 필드 갱신 */
  onSmiMetaChange: (index: number, meta: SmiMeta) => void;
  prevFocusRef: RefObject<HTMLElement | null>;
}

/** I/O 트리거 — 툴바 버튼 2개 + 모달 조립 */
export interface SubtitleIoProps {
  sheetFormat: SubtitleFormat;
  timelines: readonly SheetTimelineItem[];
  workbookTabs: readonly ExportWorkbookTab[];
  activeIndex: number;
  onImported: (timelines: SheetTimelineItem[]) => void;
  onSmiMetaChange: (index: number, meta: SmiMeta) => void;
}
