import {
	buildExcel,
	DEFAULT_ENCODING,
	encodeText,
	formatExportData,
	serializeJsonWorkbook,
	serializeSmi,
	serializeSrt,
	serializeVtt,
	type SubtitleExportFormat,
	type SubtitleFormat,
	type SubtitleTimeline,
} from '@/entities/subtitle';
import { downloadBytes } from './download-bytes';
import type { ExportSubtitleOptions, ExportWorkbookTab } from '../types';

const toSubtitleTimelines = (
	timelines: ExportSubtitleOptions['timelines'],
): SubtitleTimeline[] =>
	timelines.map((item) => ({
		start: typeof item.start === 'number' ? item.start : 0,
		end: typeof item.end === 'number' ? item.end : undefined,
		text: typeof item.text === 'string' ? item.text : '',
		memo: typeof item.memo === 'string' ? item.memo : '',
	}));

const buildFilename = (filename: string, exportFormat: SubtitleExportFormat) => {
	const trimmed = filename.trim();
	if (!trimmed) return `subtitle.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
	if (/\.(smi|srt|vtt|json|xlsx)$/i.test(trimmed)) return trimmed;
	if (exportFormat === 'excel') return `${trimmed}.xlsx`;
	return `${trimmed}.${exportFormat}`;
};

interface BuiltExportFile {
	filename: string;
	bytes: Uint8Array;
	/** encode 전 문자열 (테스트·디버그). excel은 빈 문자열 */
	payload: string;
}

const resolveWorkbookTabs = (
	options: ExportSubtitleOptions,
): ExportWorkbookTab[] => {
	if (options.workbookTabs?.length) {
		return options.workbookTabs.map((tab) => ({
			name: tab.name,
			timelines: tab.timelines,
		}));
	}
	return [{ name: 'Sheet1', timelines: options.timelines }];
};

const buildJsonWorkbookPayload = (
	options: ExportSubtitleOptions,
	dataFormat: SubtitleFormat,
): string => {
	const tabs = resolveWorkbookTabs(options);
	const sheets = tabs.map((tab) => ({
		name: tab.name,
		timelines: formatExportData({
			exportFormat: 'json',
			sheetFormat: options.sheetFormat,
			sheetData: toSubtitleTimelines(tab.timelines),
			dataFormat,
		}),
	}));
	return serializeJsonWorkbook({ sheets });
};

const serializePayload = (
	exportFormat: SubtitleExportFormat,
	exportData: SubtitleTimeline[],
	removeStyle: boolean,
): string => {
	if (exportFormat === 'smi') return serializeSmi(exportData);
	if (exportFormat === 'vtt') {
		return serializeVtt(exportData, { removeStyle });
	}
	return serializeSrt(exportData, { removeStyle });
};

/** 시트 → serialize → encode (다운로드 없음 · Vitest용) */
const buildExportFile = (options: ExportSubtitleOptions): BuiltExportFile => {
	const dataFormat = options.dataFormat ?? options.sheetFormat;

	if (options.exportFormat === 'excel') {
		const tabs = resolveWorkbookTabs(options).map((tab) => ({
			name: tab.name,
			timelines: toSubtitleTimelines(tab.timelines),
		}));
		const bytes = buildExcel({
			sheetFormat: options.sheetFormat,
			columnFormat: dataFormat,
			tabs,
		});
		return {
			filename: buildFilename(options.filename, 'excel'),
			bytes,
			payload: '',
		};
	}

	if (options.exportFormat === 'json') {
		const payload = buildJsonWorkbookPayload(options, dataFormat);
		return {
			filename: buildFilename(options.filename, 'json'),
			bytes: encodeText(payload, DEFAULT_ENCODING),
			payload,
		};
	}

	const sheetData = toSubtitleTimelines(options.timelines);
	const exportData = formatExportData({
		exportFormat: options.exportFormat,
		sheetFormat: options.sheetFormat,
		sheetData,
	});

	const removeStyle =
		options.exportFormat === 'srt' || options.exportFormat === 'vtt'
			? options.removeStyle === true
			: false;

	const payload = serializePayload(
		options.exportFormat,
		exportData,
		removeStyle,
	);

	const encoding =
		options.exportFormat === 'smi' ? options.encoding : DEFAULT_ENCODING;

	return {
		filename: buildFilename(options.filename, options.exportFormat),
		bytes: encodeText(payload, encoding),
		payload,
	};
};

/** 시트 → serialize → encode → 다운로드 */
const exportSubtitleFile = (options: ExportSubtitleOptions) => {
	const built = buildExportFile(options);
	downloadBytes(built.filename, built.bytes);
};

export { buildExportFile, buildFilename, exportSubtitleFile };
export type { BuiltExportFile };
