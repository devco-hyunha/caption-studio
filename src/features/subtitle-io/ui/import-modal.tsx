import { useRef, useState, type ChangeEvent } from 'react';
import { SUBTITLE_ENCODINGS } from '@/entities/subtitle';
import type { SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useT } from '@/shared/lib/i18n';
import { alert, success } from '@/shared/lib/feedback/feedback';
import { Button } from '@/shared/ui/button';
import { DialogShell } from '@/shared/ui/dialog-shell';
import { importSheetText, importSubtitleFile } from '../lib/import-subtitle';
import { useSubtitleIoStore } from '../model/use-subtitle-io-store';
import type { SubtitleImportModalProps } from '../types';

/** 인코딩 선택 — 영속 스토어에 선택 즉시 저장 */
const EncodingSelect = ({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="flex items-center gap-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <select
      aria-label={ariaLabel}
      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {SUBTITLE_ENCODINGS.map((encoding) => (
        <option key={encoding} value={encoding}>
          {encoding}
        </option>
      ))}
    </select>
  </label>
);

/**
 * 자막 가져오기 모달 — SMI/SRT 파일·텍스트 입력.
 * 인코딩 선택은 localStorage 키(smiEncode/srtEncode)에 영속. import는 활성 탭 교체.
 */
const SubtitleImportModal = ({
  open,
  onOpenChange,
  sheetFormat,
  onImported,
  prevFocusRef,
}: SubtitleImportModalProps) => {
  const smiInputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const title = useT('io.import');
  const importEncodingLabel = useT('io.importEncoding');
  const importEncodingAria = useT('io.importEncodingAria');
  const smiFileLabel = useT('io.fileSmi');
  const srtFileLabel = useT('io.fileSrt');
  const textLabel = useT('io.text');
  const loadLabel = useT('io.load');
  const textEmptyAlert = useT('io.textEmpty');
  const formatFailAlert = useT('io.statusImportFormatFail');
  const failAlert = useT('io.statusImportFail');
  const successLabel = useT('io.statusImportSuccess');
  const rowsLabel = useT('io.statusRows');

  const smiEncode = useSubtitleIoStore((state) => state.smiEncode);
  const srtEncode = useSubtitleIoStore((state) => state.srtEncode);
  const setEncoding = useSubtitleIoStore((state) => state.setEncoding);

  const applyResult = (timelines: SheetTimelineItem[]) => {
    onImported(timelines);
    success(`${successLabel} (${timelines.length}${rowsLabel})`);
    setText('');
    onOpenChange(false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, encoding: string) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsBusy(true);
    try {
      const result = await importSubtitleFile(file, sheetFormat, encoding);
      applyResult(result.timelines);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      alert(message === 'not-support-file-format' ? formatFailAlert : failAlert);
    } finally {
      setIsBusy(false);
    }
  };

  const handleTextLoad = () => {
    if (text === '') {
      alert(textEmptyAlert);
      return;
    }
    applyResult(importSheetText(sheetFormat, text).timelines);
  };

  return (
    <DialogShell open={open} onOpenChange={onOpenChange} title={title} prevFocusRef={prevFocusRef}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <EncodingSelect
            label={importEncodingLabel}
            ariaLabel={importEncodingAria}
            value={smiEncode}
            onChange={(value) => setEncoding('smiEncode', value)}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{smiFileLabel}</span>
            <input
              ref={smiInputRef}
              type="file"
              accept=".smi"
              aria-label={smiFileLabel}
              className="text-sm"
              disabled={isBusy}
              onChange={(event) => void handleFileChange(event, smiEncode)}
            />
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <EncodingSelect
            label={importEncodingLabel}
            ariaLabel={importEncodingAria}
            value={srtEncode}
            onChange={(value) => setEncoding('srtEncode', value)}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{srtFileLabel}</span>
            <input
              ref={srtInputRef}
              type="file"
              accept=".srt"
              aria-label={srtFileLabel}
              className="text-sm"
              disabled={isBusy}
              onChange={(event) => void handleFileChange(event, srtEncode)}
            />
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{textLabel}</span>
            <textarea
              aria-label={textLabel}
              className="border-input bg-background h-30 rounded-md border p-2 text-sm"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            aria-label={loadLabel}
            disabled={isBusy}
            onClick={handleTextLoad}
          >
            {loadLabel}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
};

export { SubtitleImportModal };
