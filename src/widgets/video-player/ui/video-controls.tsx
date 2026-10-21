import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { VIDEO_SEEK_STEP_SEC } from '@/features/video-sync';
import { useT } from '@/shared/lib/i18n';
import { formatTime, secondsToMs } from '@/shared/lib/timecode';
import { Button } from '@/shared/ui/button';
import { SEEK_SLIDER_STEP, VOLUME_SLIDER_STEP } from '../lib/constants';
import type { VideoControlsHandle, VideoControlsProps } from '../types';

/** timeupdate 시 부모 리렌더 없이 내부 state로 진행 시각만 갱신 */
const VideoControls = forwardRef<VideoControlsHandle, VideoControlsProps>(
  (
    {
      playing,
      duration,
      volume,
      muted,
      disabled = false,
      onTogglePlay,
      onSeek,
      onSeekBy,
      onVolumeChange,
      onToggleMute,
      onCarveTime,
    },
    ref,
  ) => {
    const [currentTime, setCurrentTime] = useState(0);
    const currentTimeRef = useRef(0);

    const playStop = useT('video.playStop');
    const playLabel = useT('video.play');
    const pauseLabel = useT('video.pause');
    const videoPrev = useT('video.prev');
    const videoNext = useT('video.next');
    const timeCarve = useT('video.carve');
    const controlsAria = useT('video.controlsAria');
    const seekLabel = useT('video.seekLabel');
    const seekAria = useT('video.seekAria');
    const volumeLabel = useT('video.volumeLabel');
    const volumeAria = useT('video.volumeAria');
    const muteLabel = useT('video.mute');
    const unmuteLabel = useT('video.unmute');
    const muteAria = useT('video.muteAria');
    const unmuteAria = useT('video.unmuteAria');
    const muteAriaLabel = muted ? unmuteAria : muteAria;

    useImperativeHandle(
      ref,
      () => ({
        setCurrentTime: (seconds: number) => {
          if (!Number.isFinite(seconds)) return;
          const next = Math.max(0, seconds);
          currentTimeRef.current = next;
          setCurrentTime(next);
        },
        getCurrentTime: () => currentTimeRef.current,
      }),
      [],
    );

    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const progressMax = safeDuration > 0 ? safeDuration : 1;
    const sliderVolume = muted ? 0 : volume;

    return (
      <div
        className="bg-muted/40 flex flex-col gap-2 rounded-lg border p-2"
        role="group"
        aria-label={controlsAria}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            aria-label={playStop}
            onClick={onTogglePlay}
          >
            {playing ? pauseLabel : playLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            aria-label={videoPrev}
            onClick={() => onSeekBy(-VIDEO_SEEK_STEP_SEC)}
          >
            {videoPrev}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            aria-label={videoNext}
            onClick={() => onSeekBy(VIDEO_SEEK_STEP_SEC)}
          >
            {videoNext}
          </Button>
          {onCarveTime ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              aria-label={timeCarve}
              onClick={onCarveTime}
            >
              {timeCarve}
            </Button>
          ) : null}
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatTime(secondsToMs(currentTime), true)} /{' '}
            {formatTime(secondsToMs(safeDuration), true)}
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground shrink-0">{seekLabel}</span>
          <input
            type="range"
            min={0}
            max={progressMax}
            step={SEEK_SLIDER_STEP}
            value={Math.min(currentTime, progressMax)}
            disabled={disabled || safeDuration <= 0}
            aria-label={seekAria}
            className="accent-primary h-2 w-full"
            onChange={(event) => onSeek(Number(event.target.value))}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            aria-label={muteAriaLabel}
            aria-pressed={muted}
            onClick={onToggleMute}
          >
            {muted || volume === 0 ? unmuteLabel : muteLabel}
          </Button>
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-muted-foreground shrink-0">{volumeLabel}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={VOLUME_SLIDER_STEP}
              value={sliderVolume}
              disabled={disabled}
              aria-label={volumeAria}
              className="accent-primary h-2 w-40 max-w-full"
              onChange={(event) => onVolumeChange(Number(event.target.value))}
            />
          </label>
        </div>
      </div>
    );
  },
);

VideoControls.displayName = 'VideoControls';

export { VideoControls };
