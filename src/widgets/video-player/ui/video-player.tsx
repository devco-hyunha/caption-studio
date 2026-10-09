import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type SyntheticEvent,
} from 'react';
import ReactPlayer from 'react-player';
import {
	registerVideoPlayerControlApi,
	requestSheetTimeCarve,
	syncPlaybackFromPlayerTime,
	useVideoSyncStore,
	type VideoPlayerControlApi,
} from '@/features/video-sync';
import { cn } from '@/shared/lib/utils';
import {
	CHROMELESS_PLAYER_CONFIG,
	CHROMELESS_PLAYER_STYLE,
} from '../lib/chromeless-player-config';
import { canAcceptVideoFile, detectVideoSourceKind } from '../lib/detect-video-source';
import type {
	VideoControlsHandle,
	VideoInputKind,
	VideoPlayerHandle,
	VideoPlayerProps,
	VideoPlayerSource,
} from '../types';
import { VideoControls } from './video-controls';
import { VideoOverlayNav } from './video-overlay-nav';
import { VideoSourceForm } from './video-source-form';
import { VideoSubtitleOverlay } from './video-subtitle-overlay';

const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
	({ className, onTimeUpdate, onPlayStateChange }, ref) => {
		const mediaRef = useRef<HTMLVideoElement | null>(null);
		const objectUrlRef = useRef<string | null>(null);
		const pendingFileRef = useRef<File | null>(null);
		const controlsRef = useRef<VideoControlsHandle | null>(null);
		const controlApiRef = useRef<VideoPlayerControlApi>({
			seekTo: () => false,
			getCurrentTime: () => 0,
			toggle: () => {},
			setVolume: () => {},
			getVolume: () => 0,
		});
		const playerHandleRef = useRef<VideoPlayerHandle>({
			seekTo: () => false,
			toggle: () => {},
			play: () => {},
			pause: () => {},
			setVolume: () => {},
			getVolume: () => 0,
			toggleMute: () => {},
			isMuted: () => false,
			getCurrentTime: () => 0,
			getDuration: () => 0,
			isPlaying: () => false,
		});

		const [inputKind, setInputKind] = useState<VideoInputKind>('file');
		const [urlDraft, setUrlDraft] = useState('');
		const [fileLabel, setFileLabel] = useState<string | null>(null);
		const [source, setSource] = useState<VideoPlayerSource | null>(null);
		const [playing, setPlaying] = useState(false);
		const [volume, setVolume] = useState(0.8);
		const [muted, setMuted] = useState(false);
		const volumeBeforeMuteRef = useRef(0.8);
		const [duration, setDuration] = useState(0);
		const [errorMessage, setErrorMessage] = useState<string | null>(null);

		const revokeObjectUrl = () => {
			if (!objectUrlRef.current) return;
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		};

		useEffect(
			() => () => {
				revokeObjectUrl();
			},
			[],
		);

		const applyPlaying = (next: boolean) => {
			setPlaying(next);
			onPlayStateChange?.(next);
		};

		const publishCurrentTime = (seconds: number) => {
			controlsRef.current?.setCurrentTime(seconds);
		};

		const seekTo = (seconds: number): boolean => {
			const media = mediaRef.current;
			if (!media || !Number.isFinite(seconds)) return false;
			const next = Math.max(0, seconds);
			media.currentTime = next;
			publishCurrentTime(next);
			syncPlaybackFromPlayerTime(next);
			return true;
		};

		const applyVolume = (next: number) => {
			const clamped = clampVolume(next);
			setVolume(clamped);
			if (clamped > 0) {
				volumeBeforeMuteRef.current = clamped;
				setMuted(false);
			} else {
				setMuted(true);
			}
		};

		const toggleMute = () => {
			if (muted || volume === 0) {
				const restored =
					volumeBeforeMuteRef.current > 0 ? volumeBeforeMuteRef.current : 0.8;
				setVolume(restored);
				setMuted(false);
				return;
			}
			volumeBeforeMuteRef.current = volume > 0 ? volume : volumeBeforeMuteRef.current;
			setMuted(true);
		};

		const togglePlaying = () => {
			applyPlaying(!playing);
		};

		controlApiRef.current = {
			seekTo,
			getCurrentTime: () => mediaRef.current?.currentTime ?? 0,
			toggle: togglePlaying,
			setVolume: applyVolume,
			getVolume: () => volume,
		};

		playerHandleRef.current = {
			seekTo,
			toggle: togglePlaying,
			play: () => {
				applyPlaying(true);
			},
			pause: () => {
				applyPlaying(false);
			},
			setVolume: applyVolume,
			getVolume: () => volume,
			toggleMute,
			isMuted: () => muted || volume === 0,
			getCurrentTime: () => mediaRef.current?.currentTime ?? 0,
			getDuration: () => mediaRef.current?.duration || duration,
			isPlaying: () => playing,
		};

		useEffect(() => {
			registerVideoPlayerControlApi({
				seekTo: (seconds) => controlApiRef.current.seekTo(seconds),
				getCurrentTime: () => controlApiRef.current.getCurrentTime(),
				toggle: () => controlApiRef.current.toggle(),
				setVolume: (next) => controlApiRef.current.setVolume(next),
				getVolume: () => controlApiRef.current.getVolume(),
			});
			return () => {
				registerVideoPlayerControlApi(null);
			};
		}, []);

		// 최신 핸들러는 playerHandleRef에 두고, imperative handle 정체성은 고정
		useImperativeHandle(
			ref,
			() => ({
				seekTo: (seconds) => playerHandleRef.current.seekTo(seconds),
				toggle: () => playerHandleRef.current.toggle(),
				play: () => playerHandleRef.current.play(),
				pause: () => playerHandleRef.current.pause(),
				setVolume: (next) => playerHandleRef.current.setVolume(next),
				getVolume: () => playerHandleRef.current.getVolume(),
				toggleMute: () => playerHandleRef.current.toggleMute(),
				isMuted: () => playerHandleRef.current.isMuted(),
				getCurrentTime: () => playerHandleRef.current.getCurrentTime(),
				getDuration: () => playerHandleRef.current.getDuration(),
				isPlaying: () => playerHandleRef.current.isPlaying(),
			}),
			[],
		);

		const handleKindChange = (kind: VideoInputKind) => {
			setInputKind(kind);
			setErrorMessage(null);
			if (kind === 'file') {
				setUrlDraft('');
			} else {
				pendingFileRef.current = null;
				setFileLabel(null);
			}
		};

		const handleFileSelected = (file: File | null) => {
			setErrorMessage(null);
			if (!file) {
				pendingFileRef.current = null;
				setFileLabel(null);
				return;
			}
			if (!canAcceptVideoFile(file)) {
				pendingFileRef.current = null;
				setFileLabel(null);
				setErrorMessage('지원하지 않는 파일 형식입니다.');
				return;
			}
			pendingFileRef.current = file;
			setFileLabel(file.name);
		};

		const handleLoad = () => {
			setErrorMessage(null);
			applyPlaying(false);
			publishCurrentTime(0);
			setDuration(0);
			useVideoSyncStore.getState().clearActiveIndices();

			if (inputKind === 'file') {
				const file = pendingFileRef.current;
				if (!file) {
					setErrorMessage('비디오 파일을 선택하세요.');
					return;
				}
				revokeObjectUrl();
				const objectUrl = URL.createObjectURL(file);
				objectUrlRef.current = objectUrl;
				setSource({ kind: 'file', src: objectUrl, label: file.name });
				return;
			}

			const raw = urlDraft.trim();
			if (!raw) {
				setErrorMessage('URL을 입력하세요.');
				return;
			}

			revokeObjectUrl();
			setSource({
				kind: detectVideoSourceKind(raw),
				src: raw,
			});
		};

		const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
			const seconds = event.currentTarget.currentTime;
			publishCurrentTime(seconds);
			syncPlaybackFromPlayerTime(seconds);
			onTimeUpdate?.(seconds);
		};

		const handleDurationChange = (event: SyntheticEvent<HTMLVideoElement>) => {
			const next = event.currentTarget.duration;
			if (Number.isFinite(next)) setDuration(next);
		};

		const handleEnded = () => {
			applyPlaying(false);
			useVideoSyncStore.getState().clearActiveIndices();
		};

		const handleError = () => {
			setErrorMessage('재생할 수 없는 소스입니다.');
			applyPlaying(false);
		};

		const hasSource = Boolean(source?.src);

		return (
			<section
				className={cn('bg-card flex min-h-0 flex-col gap-3 rounded-xl border p-3', className)}
				aria-label="비디오 플레이어"
			>
				<VideoSourceForm
					activeKind={inputKind}
					urlDraft={urlDraft}
					fileLabel={fileLabel}
					onKindChange={handleKindChange}
					onUrlDraftChange={setUrlDraft}
					onFileSelected={handleFileSelected}
					onLoad={handleLoad}
				/>
				{errorMessage ? (
					<p className="text-destructive text-sm" role="alert">
						{errorMessage}
					</p>
				) : null}
				<div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg [&_iframe]:pointer-events-none">
					{hasSource ? (
						<ReactPlayer
							ref={mediaRef}
							src={source!.src}
							playing={playing}
							volume={volume}
							muted={muted}
							controls={false}
							width="100%"
							height="100%"
							config={CHROMELESS_PLAYER_CONFIG}
							style={CHROMELESS_PLAYER_STYLE}
							onTimeUpdate={handleTimeUpdate}
							onDurationChange={handleDurationChange}
							onEnded={handleEnded}
							onError={handleError}
							onPlay={() => applyPlaying(true)}
							onPause={() => applyPlaying(false)}
						/>
					) : (
						<div className="text-muted-foreground flex h-full items-center justify-center text-sm">
							소스를 Load 하면 재생됩니다
						</div>
					)}
					{hasSource ? (
						<>
							<VideoOverlayNav />
							<VideoSubtitleOverlay />
						</>
					) : null}
				</div>
				<VideoControls
					ref={controlsRef}
					playing={playing}
					duration={duration}
					volume={volume}
					muted={muted}
					disabled={!hasSource}
					onTogglePlay={() => applyPlaying(!playing)}
					onSeek={seekTo}
					onSeekBy={(delta) => {
						const base = mediaRef.current?.currentTime ?? 0;
						seekTo(base + delta);
					}}
					onVolumeChange={applyVolume}
					onToggleMute={toggleMute}
					onCarveTime={requestSheetTimeCarve}
				/>
			</section>
		);
	},
);

VideoPlayer.displayName = 'VideoPlayer';

export { VideoPlayer };
