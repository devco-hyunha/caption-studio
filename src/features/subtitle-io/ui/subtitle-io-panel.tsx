import { useRef, useState, type ChangeEvent } from 'react';
import {
	DEFAULT_ENCODING,
	DEFAULT_EXPORT_ENCODING_SMI,
	SUBTITLE_ENCODINGS,
	type SubtitleExportFormat,
	type SubtitleFormat,
} from '@/entities/subtitle';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { Button } from '@/shared/ui/button';
import { exportSubtitleFile } from '../lib/export-subtitle';
import { importSubtitleFile } from '../lib/import-subtitle';
import type { ExportWorkbookTab } from '../types';

export interface SubtitleIoPanelProps {
	/** 현재 UI 시트 포맷 (import 변환 목표 · export 기본) */
	sheetFormat: SubtitleFormat;
	timelines: readonly SheetTimelineItem[];
	/** json/excel — 자막 탭 전체 */
	workbookTabs: readonly ExportWorkbookTab[];
	onImported: (timelines: SheetTimelineItem[]) => void;
}

/**
 * Verify용 최소 I/O 패널.
 * import/export 인코딩 분리. 풀 모달·i18n 셸은 S6.
 */
const SubtitleIoPanel = ({
	sheetFormat,
	timelines,
	workbookTabs,
	onImported,
}: SubtitleIoPanelProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importEncoding, setImportEncoding] = useState<string>(DEFAULT_ENCODING);
	const [exportFormat, setExportFormat] =
		useState<SubtitleExportFormat>(sheetFormat);
	/** SMI 내보내기만 선택 · 기본 EUC-KR */
	const [smiExportEncoding, setSmiExportEncoding] = useState<string>(
		DEFAULT_EXPORT_ENCODING_SMI,
	);
	/**
	 * JSON/Excel 데이터 형태.
	 * null이면 sheetFormat 따름 · 선택 시에만 override.
	 */
	const [dataFormatOverride, setDataFormatOverride] =
		useState<SubtitleFormat | null>(null);
	const dataFormat = dataFormatOverride ?? sheetFormat;
	/** SRT/VTT — font/b/i/u 등 제거, br 유지 */
	const [removeStyle, setRemoveStyle] = useState(false);
	const [filename, setFilename] = useState('subtitle');
	const [status, setStatus] = useState('');
	const [isBusy, setIsBusy] = useState(false);

	const showsSmiEncoding = exportFormat === 'smi';
	const showsRemoveStyle =
		exportFormat === 'srt' || exportFormat === 'vtt';

	const handleImportEncodingChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setImportEncoding(event.target.value);
	};

	const handleSmiExportEncodingChange = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		setSmiExportEncoding(event.target.value);
	};

	const handleExportFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setExportFormat(event.target.value as SubtitleExportFormat);
	};

	const handleDataFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setDataFormatOverride(event.target.value as SubtitleFormat);
	};

	const showsDataFormat =
		exportFormat === 'json' || exportFormat === 'excel';

	const handleFilenameChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFilename(event.target.value);
	};

	const handleRemoveStyleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRemoveStyle(event.target.checked);
	};

	const handlePickFile = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;

		setIsBusy(true);
		setStatus('');
		try {
			const result = await importSubtitleFile(file, sheetFormat, importEncoding);
			onImported(result.timelines);
			setStatus(`가져오기 완료 (${result.timelines.length}행)`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'import-failed';
			setStatus(
				message === 'not-support-file-format'
					? '지원하지 않는 파일 형식'
					: '가져오기 실패',
			);
		} finally {
			setIsBusy(false);
		}
	};

	const handleExport = () => {
		setStatus('');
		try {
			exportSubtitleFile({
				sheetFormat,
				exportFormat,
				timelines,
				workbookTabs,
				encoding:
					exportFormat === 'smi' ? smiExportEncoding : DEFAULT_ENCODING,
				filename,
				removeStyle: showsRemoveStyle ? removeStyle : false,
				dataFormat: showsDataFormat ? dataFormat : undefined,
			});
			setStatus('내보내기 완료');
		} catch {
			setStatus('내보내기 실패');
		}
	};

	return (
		<div
			role="toolbar"
			aria-label="Subtitle import export"
			className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5"
		>
			<span className="text-muted-foreground text-xs">I/O</span>
			<label className="flex items-center gap-1 text-xs">
				<span className="text-muted-foreground">가져오기 인코딩</span>
				<select
					aria-label="Import encoding"
					className="border-input bg-background h-8 rounded-md border px-2 text-xs"
					value={importEncoding}
					onChange={handleImportEncodingChange}
				>
					{SUBTITLE_ENCODINGS.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</label>
			<input
				ref={fileInputRef}
				type="file"
				accept=".smi,.srt"
				className="sr-only"
				aria-hidden
				tabIndex={-1}
				onChange={handleFileChange}
			/>
			<Button
				type="button"
				size="sm"
				variant="outline"
				aria-label="Import subtitle file"
				disabled={isBusy}
				onClick={handlePickFile}
			>
				가져오기
			</Button>
			<span className="bg-border mx-1 h-4 w-px" aria-hidden />
			<label className="flex items-center gap-1 text-xs">
				<span className="text-muted-foreground">형식</span>
				<select
					aria-label="Export format"
					className="border-input bg-background h-8 rounded-md border px-2 text-xs"
					value={exportFormat}
					onChange={handleExportFormatChange}
				>
					<option value="smi">SMI</option>
					<option value="srt">SRT</option>
					<option value="vtt">VTT</option>
					<option value="json">JSON</option>
					<option value="excel">Excel</option>
				</select>
			</label>
			{showsDataFormat ? (
				<label className="flex items-center gap-1 text-xs">
					<span className="text-muted-foreground">데이터 형태</span>
					<select
						aria-label="Workbook data format"
						className="border-input bg-background h-8 rounded-md border px-2 text-xs"
						value={dataFormat}
						onChange={handleDataFormatChange}
					>
						<option value="smi">SMI</option>
						<option value="srt">SRT</option>
					</select>
				</label>
			) : null}
			{showsSmiEncoding ? (
				<label className="flex items-center gap-1 text-xs">
					<span className="text-muted-foreground">SMI 인코딩</span>
					<select
						aria-label="SMI export encoding"
						className="border-input bg-background h-8 rounded-md border px-2 text-xs"
						value={smiExportEncoding}
						onChange={handleSmiExportEncodingChange}
					>
						{SUBTITLE_ENCODINGS.map((value) => (
							<option key={`export-${value}`} value={value}>
								{value}
							</option>
						))}
					</select>
				</label>
			) : null}
			<label className="flex items-center gap-1 text-xs">
				<span className="text-muted-foreground">파일명</span>
				<input
					type="text"
					aria-label="Export filename"
					className="border-input bg-background h-8 w-28 rounded-md border px-2 text-xs"
					value={filename}
					onChange={handleFilenameChange}
				/>
			</label>
			{showsRemoveStyle ? (
				<label className="flex items-center gap-1 text-xs">
					<input
						type="checkbox"
						aria-label="Remove style on export"
						checked={removeStyle}
						onChange={handleRemoveStyleChange}
					/>
					<span className="text-muted-foreground">스타일 제거</span>
				</label>
			) : null}
			<Button
				type="button"
				size="sm"
				variant="outline"
				aria-label="Export subtitle file"
				onClick={handleExport}
			>
				내보내기
			</Button>
			{status ? (
				<span className="text-muted-foreground text-xs" role="status">
					{status}
				</span>
			) : null}
		</div>
	);
};

export { SubtitleIoPanel };
