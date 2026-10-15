import { useRef, useState, type ChangeEvent } from 'react';
import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import {
  DEFAULT_ENCODING,
  DEFAULT_EXPORT_ENCODING_SMI,
  SUBTITLE_ENCODINGS,
} from '@/entities/subtitle';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { exportSubtitleFile } from '../lib/export-subtitle';
import { importSubtitleFile } from '../lib/import-subtitle';
import type { SubtitleIoPanelProps } from '../types';

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
  /**
   * exportFormat — base가 현재 sheetFormat일 때만 선택 유지.
   * 시트 포맷 전환 시 자동으로 현재 시트 포맷에 동기화.
   */
  const [exportFormatState, setExportFormatState] = useState<{
    base: SubtitleFormat;
    value: SubtitleExportFormat;
  }>({ base: sheetFormat, value: sheetFormat });
  const exportFormat =
    exportFormatState.base === sheetFormat ? exportFormatState.value : sheetFormat;
  /** SMI 내보내기만 선택 · 기본 EUC-KR */
  const [smiExportEncoding, setSmiExportEncoding] = useState<string>(DEFAULT_EXPORT_ENCODING_SMI);
  /**
   * JSON/Excel 데이터 형태.
   * null이면 sheetFormat 따름 · 선택 시에만 override.
   */
  const [dataFormatState, setDataFormatState] = useState<{
    base: SubtitleFormat;
    value: SubtitleFormat;
  } | null>(null);
  const dataFormat =
    dataFormatState && dataFormatState.base === sheetFormat ? dataFormatState.value : sheetFormat;
  /** SRT/VTT — font/b/i/u 등 제거, br 유지 */
  const [removeStyle, setRemoveStyle] = useState(false);
  const [filename, setFilename] = useState('subtitle');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const importLabel = useT('io.import');
  const exportLabel = useT('io.export');
  const filenameLabel = useT('io.filename');
  const removeStyleLabel = useT('io.removeStyle');
  const importEncodingLabel = useT('io.importEncoding');
  const exportFormatLabel = useT('io.exportFormat');
  const dataFormatLabel = useT('io.dataFormat');
  const smiEncodingLabel = useT('io.smiEncoding');
  const panelAria = useT('io.aria');
  const importEncodingAria = useT('io.importEncodingAria');
  const importAria = useT('io.importAria');
  const exportFormatAria = useT('io.exportFormatAria');
  const dataFormatAria = useT('io.dataFormatAria');
  const smiEncodingAria = useT('io.smiEncodingAria');
  const filenameAria = useT('io.filenameAria');
  const removeStyleAria = useT('io.removeStyleAria');
  const exportAria = useT('io.exportAria');
  const statusImportSuccess = useT('io.statusImportSuccess');
  const statusRows = useT('io.statusRows');
  const statusImportFormatFail = useT('io.statusImportFormatFail');
  const statusImportFail = useT('io.statusImportFail');
  const statusExportSuccess = useT('io.statusExportSuccess');
  const statusExportFail = useT('io.statusExportFail');

  const showsSmiEncoding = exportFormat === 'smi';
  const showsRemoveStyle = exportFormat === 'srt' || exportFormat === 'vtt';

  const handleImportEncodingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setImportEncoding(event.target.value);
  };

  const handleSmiExportEncodingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSmiExportEncoding(event.target.value);
  };

  const handleExportFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setExportFormatState({ base: sheetFormat, value: event.target.value as SubtitleExportFormat });
  };

  const handleDataFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDataFormatState({ base: sheetFormat, value: event.target.value as SubtitleFormat });
  };

  const showsDataFormat = exportFormat === 'json' || exportFormat === 'excel';

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
      setStatus(`${statusImportSuccess} (${result.timelines.length}${statusRows})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'import-failed';
      setStatus(message === 'not-support-file-format' ? statusImportFormatFail : statusImportFail);
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
        encoding: exportFormat === 'smi' ? smiExportEncoding : DEFAULT_ENCODING,
        filename,
        removeStyle: showsRemoveStyle ? removeStyle : false,
        dataFormat: showsDataFormat ? dataFormat : undefined,
      });
      setStatus(statusExportSuccess);
    } catch {
      setStatus(statusExportFail);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label={panelAria}
      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5"
    >
      <span className="text-muted-foreground text-xs">I/O</span>
      <label className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">{importEncodingLabel}</span>
        <select
          aria-label={importEncodingAria}
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
        aria-label={importAria}
        disabled={isBusy}
        onClick={handlePickFile}
      >
        {importLabel}
      </Button>
      <span className="bg-border mx-1 h-4 w-px" aria-hidden />
      <label className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground">{exportFormatLabel}</span>
        <select
          aria-label={exportFormatAria}
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
          <span className="text-muted-foreground">{dataFormatLabel}</span>
          <select
            aria-label={dataFormatAria}
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
          <span className="text-muted-foreground">{smiEncodingLabel}</span>
          <select
            aria-label={smiEncodingAria}
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
        <span className="text-muted-foreground">{filenameLabel}</span>
        <input
          type="text"
          aria-label={filenameAria}
          className="border-input bg-background h-8 w-28 rounded-md border px-2 text-xs"
          value={filename}
          onChange={handleFilenameChange}
        />
      </label>
      {showsRemoveStyle ? (
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            aria-label={removeStyleAria}
            checked={removeStyle}
            onChange={handleRemoveStyleChange}
          />
          <span className="text-muted-foreground">{removeStyleLabel}</span>
        </label>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={exportAria}
        onClick={handleExport}
      >
        {exportLabel}
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
