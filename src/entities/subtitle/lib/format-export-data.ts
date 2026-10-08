import { formatTimecode } from '@/shared/lib/timecode';
import { converters } from './convert';
import type {
	SubtitleExportFormat,
	SubtitleFormat,
	SubtitleTimeline,
} from '../types';

interface FormatExportDataOptions {
	exportFormat: SubtitleExportFormat;
	sheetFormat: SubtitleFormat;
	sheetData: readonly SubtitleTimeline[];
	/**
	 * JSON 내보내기 시 배열 형태 (smi|srt).
	 * vtt는 항상 srt 변환.
	 */
	dataFormat?: SubtitleFormat;
}

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
	const convertTarget = resolveConvertTarget(
		exportFormat,
		sheetFormat,
		dataFormat,
	);

	const timelines =
		sheetFormat !== convertTarget
			? converters[convertTarget](sheetFormat, sheetData).timelines
			: [...sheetData];

	if (convertTarget === 'srt' || sheetFormat === 'srt') {
		return timelines.map(({ start, end, text, memo = '' }) => ({
			start,
			starttime: formatTimecode(start),
			end,
			endtime: formatTimecode(end ?? 0),
			text,
			memo,
		}));
	}

	if (sheetFormat === 'smi' || convertTarget === 'smi') {
		return timelines.map(({ start, text, memo = '' }) => ({
			start,
			starttime: formatTimecode(start),
			text,
			memo,
		}));
	}

	return [];
};

export { formatExportData, resolveConvertTarget };
export type { FormatExportDataOptions };
