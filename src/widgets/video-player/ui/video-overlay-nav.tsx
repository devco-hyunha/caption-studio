import {
	seekPlayerToNextCue,
	seekPlayerToPrevCue,
} from '@/features/video-sync';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface VideoOverlayNavProps {
	className?: string;
}

/**
 * overlay move-prev / move-next —
 * 현재 출력 자막 start 기준 이웃 (분 슬롯 탐색).
 */
const VideoOverlayNav = ({ className }: VideoOverlayNavProps) => {
	const handlePrev = () => {
		seekPlayerToPrevCue();
	};

	const handleNext = () => {
		seekPlayerToNextCue();
	};

	return (
		<div
			className={cn(
				'pointer-events-auto absolute top-2 right-2 z-20 flex gap-1',
				className,
			)}
			role="group"
			aria-label="자막 시점 이동"
		>
			<Button
				type="button"
				variant="secondary"
				size="sm"
				className="h-7 bg-black/60 px-2 text-xs text-white hover:bg-black/80"
				aria-label="이전 자막 시점으로 이동"
				onClick={handlePrev}
			>
				Prev
			</Button>
			<Button
				type="button"
				variant="secondary"
				size="sm"
				className="h-7 bg-black/60 px-2 text-xs text-white hover:bg-black/80"
				aria-label="다음 자막 시점으로 이동"
				onClick={handleNext}
			>
				Next
			</Button>
		</div>
	);
};

export { VideoOverlayNav };
