import type { ChangeEvent } from 'react';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import type { VideoInputKind, VideoSourceFormProps } from '../types';

const SOURCE_KINDS: VideoInputKind[] = ['file', 'url'];

const VideoSourceForm = ({
  activeKind,
  urlDraft,
  fileLabel,
  disabled = false,
  onKindChange,
  onUrlDraftChange,
  onFileSelected,
  onLoad,
}: VideoSourceFormProps) => {
  const fileLabelText = useT('video.file');
  const urlLabelText = useT('video.url');
  const urlPlaceholder = useT('video.urlPlaceholder');
  const filePlaceholder = useT('video.filePlaceholder');
  const fileAria = useT('video.fileAria');
  const urlAria = useT('video.urlAria');
  const loadLabel = useT('video.load');
  const urlHint = useT('video.urlHint');
  const sourceAria = useT('video.sourceAria');

  const kindLabels: Record<VideoInputKind, string> = {
    file: fileLabelText,
    url: urlLabelText,
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1" role="tablist" aria-label={sourceAria}>
        {SOURCE_KINDS.map((kind) => (
          <Button
            key={kind}
            type="button"
            role="tab"
            size="xs"
            variant={activeKind === kind ? 'default' : 'outline'}
            aria-selected={activeKind === kind}
            disabled={disabled}
            onClick={() => onKindChange(kind)}
          >
            {kindLabels[kind]}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {activeKind === 'file' ? (
          <label
            className={cn(
              'border-input bg-background inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center rounded-lg border px-2.5 text-sm',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            <span className="text-muted-foreground truncate">{fileLabel ?? filePlaceholder}</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/*"
              className="sr-only"
              disabled={disabled}
              onChange={handleFileChange}
              aria-label={fileAria}
            />
          </label>
        ) : (
          <Input
            type="url"
            value={urlDraft}
            disabled={disabled}
            placeholder={urlPlaceholder}
            aria-label={urlAria}
            className="min-w-0 flex-1"
            onChange={(event) => onUrlDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onLoad();
                event.currentTarget.blur();
              }
            }}
          />
        )}
        <Button type="button" size="sm" disabled={disabled} onClick={onLoad}>
          {loadLabel}
        </Button>
      </div>
      {activeKind === 'url' ? <p className="text-muted-foreground text-xs">{urlHint}</p> : null}
    </div>
  );
};

export { VideoSourceForm };
