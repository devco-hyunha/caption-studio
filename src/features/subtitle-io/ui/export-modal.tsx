import { useState, type ChangeEvent } from 'react';
import { DEFAULT_EXPORT_ENCODING_SRT, SUBTITLE_ENCODINGS } from '@/entities/subtitle';
import { useT, useLocaleStore } from '@/shared/lib/i18n';
import { alert, success } from '@/shared/lib/feedback/feedback';
import { Button } from '@/shared/ui/button';
import { DialogShell } from '@/shared/ui/dialog-shell';
import { Input } from '@/shared/ui/input';
import { toUpperFormat } from '@/shared/lib/format';
import { exportSubtitleFile } from '../lib/export-subtitle';
import { ENCODING_KEY_BY_FORMAT, EXPORT_FORMATS } from '../lib/constants';
import { useSubtitleIoStore } from '../model/use-subtitle-io-store';
import { SheetPicker } from './sheet-picker';
import { SmiMetaFields } from './smi-meta-fields';
import type { SubtitleExportFormat, SubtitleFormat } from '@/shared/types/subtitle-format';
import type { SubtitleExportModalProps } from '../types';

/**
 * 자막 내보내기 모달 — 형식·시트 피커(체크박스)·SMI 메타·인코딩·파일명·스타일 제거.
 * 다중 탭 선택 시 smi/srt/vtt는 zip, 단일 선택은 단일 파일. json/excel은 선택 탭 전체.
 */
const SubtitleExportModal = ({
  open,
  onOpenChange,
  sheetFormat,
  timelines,
  workbookTabs,
  activeIndex,
  onSmiMetaChange,
  prevFocusRef,
}: SubtitleExportModalProps) => {
  const [selected, setSelected] = useState<number[]>([activeIndex]);
  const [exportFormatState, setExportFormatState] = useState<{
    base: SubtitleFormat;
    value: SubtitleExportFormat;
  }>({ base: sheetFormat, value: sheetFormat });
  const [dataFormatState, setDataFormatState] = useState<{
    base: SubtitleFormat;
    value: SubtitleFormat;
  } | null>(null);
  const [filename, setFilename] = useState('subtitle');
  const [removeStyle, setRemoveStyle] = useState(false);

  const title = useT('io.export');
  const exportFormatLabel = useT('io.exportFormat');
  const dataFormatLabel = useT('io.dataFormat');
  const encodingLabel = useT('io.exportEncoding');
  const filenameLabel = useT('io.filename');
  const removeStyleLabel = useT('io.removeStyle');
  const exportLabel = useT('io.exportAria');
  const sheetEmptyAlert = useT('io.sheetEmpty');
  const successLabel = useT('io.statusExportSuccess');
  const failAlert = useT('io.statusExportFail');

  const encodingValues = useSubtitleIoStore();
  const setEncoding = useSubtitleIoStore((state) => state.setEncoding);
  const locale = useLocaleStore((state) => state.locale);

  const exportFormat =
    exportFormatState.base === sheetFormat ? exportFormatState.value : sheetFormat;
  const dataFormat =
    dataFormatState && dataFormatState.base === sheetFormat ? dataFormatState.value : sheetFormat;

  const encodingKey = ENCODING_KEY_BY_FORMAT[toUpperFormat(exportFormat)];
  const encoding = encodingKey ? encodingValues[encodingKey] : DEFAULT_EXPORT_ENCODING_SRT;
  const showsDataFormat = exportFormat === 'json' || exportFormat === 'excel';
  const showsRemoveStyle = exportFormat === 'srt' || exportFormat === 'vtt';
  const showsSmiMeta = exportFormat === 'smi';

  const names = workbookTabs.map((tab) => tab.name);
  const activeTab = workbookTabs[activeIndex];

  const handleFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setExportFormatState({ base: sheetFormat, value: event.target.value as SubtitleExportFormat });
  };

  const handleDataFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDataFormatState({ base: sheetFormat, value: event.target.value as SubtitleFormat });
  };

  const handleEncodingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!encodingKey) return;
    setEncoding(encodingKey, event.target.value);
  };

  const handleFilenameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };

  const handleRemoveStyleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRemoveStyle(event.target.checked);
  };

  const handleExport = () => {
    const tabs = selected.map((index) => workbookTabs[index]).filter(Boolean);
    if (tabs.length === 0) {
      alert(sheetEmptyAlert);
      return;
    }

    try {
      exportSubtitleFile({
        sheetFormat,
        exportFormat,
        timelines: activeTab?.timelines ?? timelines,
        workbookTabs: tabs,
        selectedTabs: tabs,
        encoding,
        filename,
        removeStyle: showsRemoveStyle ? removeStyle : false,
        dataFormat: showsDataFormat ? dataFormat : undefined,
        locale,
      });
      success(successLabel);
      onOpenChange(false);
    } catch {
      alert(failAlert);
    }
  };

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} title={title} prevFocusRef={prevFocusRef}>
      <div className="flex flex-col gap-3">
        <SheetPicker names={names} selected={selected} onChange={setSelected} />

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">{exportFormatLabel}</span>
            <select
              aria-label={exportFormatLabel}
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
              value={exportFormat}
              onChange={handleFormatChange}
            >
              {EXPORT_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>
          {showsDataFormat ? (
            <label className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">{dataFormatLabel}</span>
              <select
                aria-label={dataFormatLabel}
                className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                value={dataFormat}
                onChange={handleDataFormatChange}
              >
                <option value="smi">smi</option>
                <option value="srt">srt</option>
              </select>
            </label>
          ) : null}
          {encodingKey ? (
            <label className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">{encodingLabel}</span>
              <select
                aria-label={encodingLabel}
                className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                value={encoding}
                onChange={handleEncodingChange}
              >
                {SUBTITLE_ENCODINGS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showsSmiMeta && activeTab ? (
            <SmiMetaFields
              meta={{ smiName: activeTab.smiName ?? '', smiLang: activeTab.smiLang ?? '' }}
              onChange={(meta) => onSmiMetaChange(activeIndex, meta)}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">{filenameLabel}</span>
            <Input aria-label={filenameLabel} value={filename} onChange={handleFilenameChange} />
          </label>
          {showsRemoveStyle ? (
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                aria-label={removeStyleLabel}
                checked={removeStyle}
                onChange={handleRemoveStyleChange}
              />
              <span>{removeStyleLabel}</span>
            </label>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="button" size="sm" aria-label={exportLabel} onClick={handleExport}>
            {title}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
};

export { SubtitleExportModal };
