import type { ComponentProps } from 'react';
import type ReactPlayer from 'react-player';

type ReactPlayerConfig = NonNullable<ComponentProps<typeof ReactPlayer>['config']>;

/**
 * YT/Vimeo 네이티브 크로마를 최대한 숨김.
 * `youtube-video-element` 타입에 없는 iframe 파라미터(controls 등)는 런타임용으로 포함.
 * 로고·정책 UI·소유자 설정에 따라 일부는 남을 수 있음.
 */
const CHROMELESS_PLAYER_CONFIG = {
	youtube: {
		// ReactPlayer `controls={false}`와 함께 — 타입 정의에 없어도 iframe은 지원
		controls: 0,
		modestbranding: 1,
		playsinline: 1,
		showinfo: 0,
		rel: 0,
		fs: 0,
		iv_load_policy: 3,
		disablekb: 1,
		cc_load_policy: 0,
	},
	vimeo: {
		controls: false,
		title: false,
		byline: false,
		portrait: false,
		pip: false,
		keyboard: false,
		fullscreen: false,
		speed: false,
		progress_bar: false,
		volume: false,
		quality_selector: false,
		vimeo_logo: false,
		unmute_button: false,
		transcript: false,
		chapters: false,
		cc: false,
		airplay: false,
		chromecast: false,
		transparent: true,
	},
} as ReactPlayerConfig;

/** react-player / media 쪽 네이티브 컨트롤 CSS 변수 */
const CHROMELESS_PLAYER_STYLE = {
	width: '100%',
	height: '100%',
	['--controls' as string]: 'none',
} as const;

export { CHROMELESS_PLAYER_CONFIG, CHROMELESS_PLAYER_STYLE };
