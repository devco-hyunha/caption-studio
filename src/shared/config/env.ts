import type { AppEnv } from './types';

/** Vite 모드 상수 (빌드 시 치환) */
const ENV_MODE = import.meta.env.MODE;

/** 앱 표시 이름 */
const APP_TITLE = import.meta.env.VITE_APP_TITLE;

/** 앱 기준 URL (OG/canonical 등에 사용) */
const APP_URL = import.meta.env.VITE_APP_URL;

/**
 * 운영(외부 수집·광고 허용) 호스트.
 * 레거시 `public/js/modules/env.js`의 PRODUCTION_HOST와 동일한 역할.
 */
const PRODUCTION_HOST = import.meta.env.VITE_PRODUCTION_HOST;

/** 개발 서버 / 개발 빌드 여부 (`vite dev`) */
const isDevelopment = (): boolean => import.meta.env.DEV;

/** 프로덕션 빌드 여부 (`vite build` 결과) */
const isProduction = (): boolean => import.meta.env.PROD;

/**
 * 실제 운영 도메인에서 실행 중인지 여부.
 * 허용 목록 방식 — localhost·미리보기 호스트에서는 false.
 */
const isProductionHost = (): boolean => {
	if (typeof globalThis.location === 'undefined') return false;
	return globalThis.location.hostname === PRODUCTION_HOST;
};

/** 읽기 전용 env 스냅샷 (디버그·설정 주입용) */
const getEnv = (): AppEnv => ({
	appTitle: APP_TITLE,
	appUrl: APP_URL,
	productionHost: PRODUCTION_HOST,
	mode: ENV_MODE,
	isDev: import.meta.env.DEV,
	isProd: import.meta.env.PROD,
});

export {
	APP_TITLE,
	APP_URL,
	ENV_MODE,
	PRODUCTION_HOST,
	getEnv,
	isDevelopment,
	isProduction,
	isProductionHost,
};
