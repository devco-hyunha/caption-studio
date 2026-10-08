import type { ChangeEvent } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import type { VideoInputKind, VideoSourceFormProps } from '../types';

const SOURCE_KINDS: { kind: VideoInputKind; label: string }[] = [
	{ kind: 'file', label: 'File' },
	{ kind: 'url', label: 'URL' },
];

const URL_PLACEHOLDER = '직접 URL · YouTube · Vimeo';

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
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		onFileSelected(file);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap gap-1" role="tablist" aria-label="비디오 소스">
				{SOURCE_KINDS.map(({ kind, label }) => (
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
						{label}
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
						<span className="text-muted-foreground truncate">
							{fileLabel ?? '비디오 파일 선택 (mp4 / webm / ogg)'}
						</span>
						<input
							type="file"
							accept="video/mp4,video/webm,video/ogg,video/*"
							className="sr-only"
							disabled={disabled}
							onChange={handleFileChange}
							aria-label="비디오 파일"
						/>
					</label>
				) : (
					<Input
						type="url"
						value={urlDraft}
						disabled={disabled}
						placeholder={URL_PLACEHOLDER}
						aria-label="비디오 URL (직접 링크, YouTube, Vimeo)"
						className="min-w-0 flex-1"
						onChange={(event) => onUrlDraftChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								onLoad();
							}
						}}
					/>
				)}
				<Button type="button" size="sm" disabled={disabled} onClick={onLoad}>
					Load
				</Button>
			</div>
			{activeKind === 'url' ? (
				<p className="text-muted-foreground text-xs">
					직접 재생 가능한 동영상 URL, YouTube, Vimeo 주소를 넣을 수 있습니다. 종류는
					주소에서 자동 인식합니다.
				</p>
			) : null}
		</div>
	);
};

export { VideoSourceForm };
