import { isProduction } from '../env.js';

const loadScript = (src, onLoad) => {
	const script = document.createElement('script');
	script.async = true;
	script.src = src;
	if (onLoad) script.onload = onLoad;
	document.head.appendChild(script);
};

const initGoogleAnalytics = () => {
	(function (i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] || function () {
			(i[r].q = i[r].q || []).push(arguments);
		};
		i[r].l = 1 * new Date();
		a = s.createElement(o);
		m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m);
	})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

	ga('create', 'UA-58132688-2', 'auto');
	ga('send', 'pageview');
};

const initNaverAnalytics = () => {
	loadScript('//wcs.naver.net/wcslog.js', () => {
		if (!window.wcs_add) window.wcs_add = {};
		window.wcs_add['wa'] = '2eb57550a65190';
		if (typeof wcs_do === 'function') wcs_do();
	});
};

/**
 * GA · 네이버 로그분석 부트스트랩.
 * 운영 호스트에서만 스크립트를 로드한다. 이벤트 전송 차단은 `trackEvent`가 담당한다.
 */
const bootstrapAnalytics = () => {
	if (!isProduction()) return;

	initGoogleAnalytics();
	initNaverAnalytics();
};

bootstrapAnalytics();
