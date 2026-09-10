import type { ReactNode } from 'react';
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { NotFound } from '@/pages/not-found';
import { isDevelopment } from '@/shared/config';
import appCss from '@/app/styles/app.css?url';

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
	return (
		<html lang="ko">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				{isDevelopment() ? <TanStackRouterDevtools position="bottom-right" /> : null}
				<Scripts />
			</body>
		</html>
	);
};

const RootComponent = () => {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
};

export const Route = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=900px,user-scalable=no',
				id: 'viewport',
			},
			{ name: 'apple-mobile-web-app-capable', content: 'no' },
			{ name: 'format-detection', content: 'telephone=no' },
			{
				name: 'description',
				content: 'Subtitle Edit Online, 온라인 자막 편집 프로그램',
			},
			{
				name: 'google-site-verification',
				content: 'OCN1QGNR2AcgTLe2Zvl8-EACXWsDoX6kn1xapTYq8QQ',
			},
			{
				name: 'naver-site-verification',
				content: '8d49614cc6608b1ccda3b781a71168bba92deb91',
			},
			{ property: 'og:type', content: 'website' },
			{ property: 'og:title', content: 'Caption Studio' },
			{
				property: 'og:description',
				content: 'Subtitle Edit Online, 온라인 자막 편집 프로그램',
			},
			{ property: 'og:url', content: '//caption.devco.kr' },
			{ name: 'twitter:card', content: 'summary' },
			{ name: 'twitter:title', content: 'Caption Studio' },
			{
				name: 'twitter:description',
				content: 'Subtitle Edit Online, 온라인 자막 편집 프로그램',
			},
			{ name: 'twitter:domain', content: '//caption.devco.kr' },
			{ name: 'msapplication-TileColor', content: 'transparent' },
			{
				name: 'msapplication-TileImage',
				content: '/favicon/ms-icon-144x144.png',
			},
			{ name: 'theme-color', content: 'transparent' },
			{ title: 'Caption Studio' },
		],
		links: [
			{ rel: 'canonical', href: '//caption.devco.kr' },
			{
				rel: 'apple-touch-icon',
				sizes: '57x57',
				href: '/favicon/apple-icon-57x57.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '60x60',
				href: '/favicon/apple-icon-60x60.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '72x72',
				href: '/favicon/apple-icon-72x72.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '76x76',
				href: '/favicon/apple-icon-76x76.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '114x114',
				href: '/favicon/apple-icon-114x114.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '120x120',
				href: '/favicon/apple-icon-120x120.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '144x144',
				href: '/favicon/apple-icon-144x144.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '152x152',
				href: '/favicon/apple-icon-152x152.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '180x180',
				href: '/favicon/apple-icon-180x180.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '192x192',
				href: '/favicon/android-icon-192x192.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				href: '/favicon/favicon-32x32.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '96x96',
				href: '/favicon/favicon-96x96.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '16x16',
				href: '/favicon/favicon-16x16.png',
			},
			{ rel: 'manifest', href: '/favicon/manifest.json' },
			{ rel: 'stylesheet', href: appCss },
		],
	}),
	component: RootComponent,
});
