import type {
	SubtitleExportFormat,
	SubtitleFormat,
} from '@/entities/subtitle';
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
