/** VideoPlayer가 등록하는 제어 API (shortkey·오버레이 공용) */
export interface VideoPlayerControlApi {
	/** 성공 시 true (미디어 미준비 등이면 false) */
	seekTo: (seconds: number) => boolean;
	getCurrentTime: () => number;
	toggle: () => void;
	setVolume: (volume: number) => void;
	getVolume: () => number;
}

/** @deprecated 이름 호환 */
export type VideoPlayerSeekApi = VideoPlayerControlApi;

let playerControlApi: VideoPlayerControlApi | null = null;

const registerVideoPlayerControlApi = (api: VideoPlayerControlApi | null) => {
	playerControlApi = api;
};

const getVideoPlayerControlApi = () => playerControlApi;

/** @deprecated 이름 호환 — control API와 동일 */
const registerVideoPlayerSeekApi = registerVideoPlayerControlApi;
const getVideoPlayerSeekApi = getVideoPlayerControlApi;

export {
	getVideoPlayerControlApi,
	getVideoPlayerSeekApi,
	registerVideoPlayerControlApi,
	registerVideoPlayerSeekApi,
};
