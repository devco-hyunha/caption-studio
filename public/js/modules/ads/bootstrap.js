import { isProduction } from '../env.js';

const AD_CLIENT = 'ca-pub-5713218026854731';
const ADS_SCRIPT_SRC = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * @returns {'unit'|'page'}
 */
const resolveMode = () => {
	const mode = new URL(import.meta.url).searchParams.get('mode');
	return mode === 'page' ? 'page' : 'unit';
};

const loadAdsScript = () => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.async = true;
	script.src = ADS_SCRIPT_SRC;
	script.onload = () => resolve();
	script.onerror = () => reject(new Error('adsbygoogle load failed'));
	document.head.appendChild(script);
});

const removeAdSlots = () => {
	document.querySelectorAll('ins.adsbygoogle').forEach((el) => el.remove());
};

/**
 * AdSense 부트스트랩.
 * 운영에서만 adsbygoogle.js를 로드한다.
 * - `?mode=unit` — 기존 `<ins class="adsbygoogle">` 유닛 push (index)
 * - `?mode=page` — 페이지 레벨 광고 (manual)
 */
const bootstrapAds = async () => {
	if (!isProduction()) {
		removeAdSlots();
		return;
	}

	const mode = resolveMode();
	window.adsbygoogle = window.adsbygoogle || [];

	try {
		await loadAdsScript();
	} catch {
		return;
	}

	if (mode === 'page') {
		window.adsbygoogle.push({
			google_ad_client: AD_CLIENT,
			enable_page_level_ads: true,
		});
		return;
	}

	window.adsbygoogle.push({});
};

bootstrapAds();
