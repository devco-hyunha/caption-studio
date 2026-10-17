import type { ComponentProps } from 'react';
import type ReactPlayer from 'react-player';
import type { Fn } from '@/shared/types/fn';
import type { VideoPlayerControlApi } from '@/features/video-sync';

/** react-player config — YT/Vimeo 크로마 숨김 파라미터 (타입 정의에 없는 iframe 파라미터 포함) */
export type ReactPlayerConfig = NonNullable<ComponentProps<typeof ReactPlayer>['config']>;

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

/** VideoPlayer ref 핸들 — 제어 API(ControlApi) + 재생/음성 상세 */
export interface VideoPlayerHandle extends VideoPlayerControlApi {
  play: Fn<void>;
  pause: Fn<void>;
  toggleMute: Fn<void>;
  isMuted: Fn<boolean>;
  getDuration: Fn<number>;
  isPlaying: Fn<boolean>;
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
  onLoad: Fn<void>;
}

/** timeupdate 시 부모 리렌더 없이 진행 시각만 갱신 */
export interface VideoControlsHandle {
  setCurrentTime: (seconds: number) => void;
  getCurrentTime: Fn<number>;
}

export interface VideoControlsProps {
  playing: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  disabled?: boolean;
  onTogglePlay: Fn<void>;
  onSeek: (seconds: number) => void;
  onSeekBy: (deltaSeconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: Fn<void>;
  /** 플레이어 시각 → 포커스 start/end 셀 */
  onCarveTime?: Fn<void>;
}

/** overlay move-prev / move-next 버튼 그룹 */
export interface VideoOverlayNavProps {
  className?: string;
}

/** 재생 중 활성 행 텍스트 오버레이 */
export interface VideoSubtitleOverlayProps {
  className?: string;
}
