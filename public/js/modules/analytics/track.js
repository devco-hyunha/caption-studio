import { isProduction } from '../env.js';

/**
 * @typedef {Object} TrackEventPayload
 * @property {string} category
 * @property {string} action
 * @property {string} label
 */

/**
 * Universal Analytics 이벤트 전송.
 * 비운영 환경이거나 `ga`가 없으면 no-op.
 *
 * @param {TrackEventPayload} payload
 */
const trackEvent = ({ category, action, label }) => {
	if (!isProduction()) return;
	if (typeof ga !== 'function') return;

	ga('send', {
		hitType: 'event',
		eventCategory: category,
		eventAction: action,
		eventLabel: label,
	});
};

export { trackEvent };
