import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { formatPlayerTime } from '../lib/format-player-time';
import type { VideoControlsHandle, VideoControlsProps } from '../types';

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
		},
		ref,
	) => {
		const [currentTime, setCurrentTime] = useState(0);
		const currentTimeRef = useRef(0);

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
				aria-label="비디오 컨트롤"
			>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={disabled}
						aria-label={playing ? '일시정지' : '재생'}
						onClick={onTogglePlay}
					>
						{playing ? 'Pause' : 'Play'}
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={disabled}
						aria-label="10초 뒤로"
						onClick={() => onSeekBy(-10)}
					>
						-10s
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={disabled}
						aria-label="10초 앞으로"
						onClick={() => onSeekBy(10)}
					>
						+10s
					</Button>
					<span className="text-muted-foreground tabular-nums text-xs">
						{formatPlayerTime(currentTime)} / {formatPlayerTime(safeDuration)}
					</span>
				</div>
				<label className="flex items-center gap-2 text-xs">
					<span className="text-muted-foreground shrink-0">Seek</span>
					<input
						type="range"
						min={0}
						max={progressMax}
						step={0.1}
						value={Math.min(currentTime, progressMax)}
						disabled={disabled || safeDuration <= 0}
						aria-label="재생 위치"
						className="h-2 w-full accent-primary"
						onChange={(event) => onSeek(Number(event.target.value))}
					/>
				</label>
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={disabled}
						aria-label={muted ? '음소거 해제' : '음소거'}
						aria-pressed={muted}
						onClick={onToggleMute}
					>
						{muted || volume === 0 ? 'Unmute' : 'Mute'}
					</Button>
					<label className="flex min-w-0 flex-1 items-center gap-2">
						<span className="text-muted-foreground shrink-0">Vol</span>
						<input
							type="range"
							min={0}
							max={1}
							step={0.05}
							value={sliderVolume}
							disabled={disabled}
							aria-label="볼륨"
							className="h-2 w-40 max-w-full accent-primary"
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
