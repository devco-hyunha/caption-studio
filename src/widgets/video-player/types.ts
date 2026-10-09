/** UI 입력 탭 — File / URL만. YT·Vimeo는 URL에서 자동 감지 */
export type VideoInputKind = 'file' | 'url';

/** 로드된 소스 종류 (URL 자동 감지 결과 포함) */
export type VideoSourceKind = VideoInputKind | 'youtube' | 'vimeo';

export interface VideoPlayerSource {
	kind: VideoSourceKind;
	/** react-player `src` (blob URL · http · YT/Vimeo URL) */
	src: string;
	/** file 선택 시 표시용 이름 */
	label?: string;
}

export interface VideoPlayerHandle {
	seekTo: (seconds: number) => boolean;
	toggle: () => void;
	play: () => void;
	pause: () => void;
	setVolume: (volume: number) => void;
	getVolume: () => number;
	toggleMute: () => void;
	isMuted: () => boolean;
	getCurrentTime: () => number;
	getDuration: () => number;
	isPlaying: () => boolean;
}

export interface VideoPlayerProps {
	className?: string;
	/** 초 단위. 이후 video-sync 연결용 */
	onTimeUpdate?: (seconds: number) => void;
	onPlayStateChange?: (playing: boolean) => void;
}

export interface VideoSourceFormProps {
	activeKind: VideoInputKind;
	urlDraft: string;
	fileLabel: string | null;
	disabled?: boolean;
	onKindChange: (kind: VideoInputKind) => void;
	onUrlDraftChange: (value: string) => void;
	onFileSelected: (file: File | null) => void;
	onLoad: () => void;
}

/** timeupdate 시 부모 리렌더 없이 진행 시각만 갱신 */
export interface VideoControlsHandle {
	setCurrentTime: (seconds: number) => void;
	getCurrentTime: () => number;
}

export interface VideoControlsProps {
	playing: boolean;
	duration: number;
	volume: number;
	muted: boolean;
	disabled?: boolean;
	onTogglePlay: () => void;
	onSeek: (seconds: number) => void;
	onSeekBy: (deltaSeconds: number) => void;
	onVolumeChange: (volume: number) => void;
	onToggleMute: () => void;
	/** 플레이어 시각 → 포커스 start/end 셀 (`/` selecttime) */
	onCarveTime?: () => void;
}
