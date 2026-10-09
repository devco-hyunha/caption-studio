import { createFileRoute } from '@tanstack/react-router';
import { CaptionShell } from '@/widgets/caption-shell';

const IndexPage = () => {
	return <CaptionShell />;
};

export const Route = createFileRoute('/')({
	ssr: false,
	head: () => ({
		links: [
			{ rel: 'stylesheet', href: '/css/material-icons.css' },
			{ rel: 'stylesheet', href: '/css/reset.css' },
			{ rel: 'stylesheet', href: '/css/common.css' },
			{ rel: 'stylesheet', href: '/css/video-js.css' },
		],
		scripts: [
			{ src: '/js/lib/webfont.js', defer: true },
			{ src: '/js/lib/video-js/video-js.min.js', defer: true },
			{ src: '/js/lib/video-js/Youtube.min.js', defer: true },
			{ src: '/js/lib/video-js/Vimeo.min.js', defer: true },
			{ src: '/js/lib/iconv-lite.js', defer: true },
			{ src: '/js/modules/analytics/bootstrap.js', type: 'module', defer: true },
			{ src: '/js/caption.js', type: 'module', defer: true },
		],
	}),
	scripts: () => [
		{ src: '/js/modules/ads/bootstrap.js?mode=unit', type: 'module' },
	],
	component: IndexPage,
});
