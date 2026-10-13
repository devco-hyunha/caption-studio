import type { VideoPlayerControlApi } from '../types';

let playerControlApi: VideoPlayerControlApi | null = null;

/** VideoPlayer 마운트 시 등록, 언마운트 시 null */
const registerVideoPlayerControlApi = (api: VideoPlayerControlApi | null) => {
  playerControlApi = api;
};

const getVideoPlayerControlApi = () => playerControlApi;

export { getVideoPlayerControlApi, registerVideoPlayerControlApi };
