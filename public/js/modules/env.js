/** 운영(외부 수집·광고 허용) 호스트 */
const PRODUCTION_HOST = 'caption.devco.kr';

/**
 * 운영 도메인인지 여부.
 * 허용 목록 방식 — 모르는 호스트는 기본적으로 수집·광고를 하지 않는다.
 *
 * @returns {boolean}
 */
const isProduction = () => location.hostname === PRODUCTION_HOST;

export { PRODUCTION_HOST, isProduction };
