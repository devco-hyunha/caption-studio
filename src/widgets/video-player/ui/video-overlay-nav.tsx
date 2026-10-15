import { seekPlayerToNextCue, seekPlayerToPrevCue } from '@/features/video-sync';
import { useT } from '@/shared/lib/i18n';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { VideoOverlayNavProps } from '../types';

/**
 * overlay move-prev / move-next —
 * 현재 출력 자막 start 기준 이웃 (분 슬롯 탐색).
 */
const VideoOverlayNav = ({ className }: VideoOverlayNavProps) => {
  const movePrev = useT('video.movePrev');
  const moveNext = useT('video.moveNext');
  const overlayAria = useT('video.overlayAria');

  const handlePrev = () => {
    seekPlayerToPrevCue();
  };

  const handleNext = () => {
    seekPlayerToNextCue();
  };

  return (
    <div
      className={cn('pointer-events-auto absolute top-2 right-2 z-20 flex gap-1', className)}
      role="group"
      aria-label={overlayAria}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-7 bg-black/60 px-2 text-xs text-white hover:bg-black/80"
        aria-label={movePrev}
        onClick={handlePrev}
      >
        {movePrev}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-7 bg-black/60 px-2 text-xs text-white hover:bg-black/80"
        aria-label={moveNext}
        onClick={handleNext}
      >
        {moveNext}
      </Button>
    </div>
  );
};

export { VideoOverlayNav };
