import { useMemo } from 'react';
import { useSheetStore, type SheetTimelineItem } from '@/entities/subtitle-sheet';
import { useVideoSyncStore } from '@/features/video-sync';
import { cn } from '@/shared/lib/utils';

const EMPTY_TIMELINES: readonly SheetTimelineItem[] = [];

const asHtmlString = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * 재생 중 활성 행 텍스트 오버레이 (다중 cue 시 줄바꿈 결합).
 */
const VideoSubtitleOverlay = ({ className }: { className?: string }) => {
	const activeIndices = useVideoSyncStore((state) => state.activeIndices);
	const timelines = useSheetStore(
		(state) => state.sheets[state.active]?.timelines ?? EMPTY_TIMELINES,
	);

	const html = useMemo(() => {
		if (activeIndices.length === 0) return '';
		return activeIndices
			.map((index) => asHtmlString(timelines[index]?.text).trim())
			.filter(Boolean)
			.join('<br />');
	}, [activeIndices, timelines]);

	if (!html) return null;

	return (
		<div
			className={cn(
				'pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-3 text-center',
				className,
			)}
			aria-live="polite"
			aria-atomic="true"
		>
			<div
				className="inline-block max-w-full rounded bg-black/70 px-3 py-1.5 text-sm leading-snug text-white [&_br]:block"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
};

export { VideoSubtitleOverlay };
