import { createRouter } from '@tanstack/react-router';
import { NotFound } from '@/pages/not-found';
import { routeTree } from './routeTree.gen';

export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultNotFoundComponent: NotFound,
	});

	return router;
};

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
