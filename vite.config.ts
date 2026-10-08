/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	server: {
		port: 3000,
	},
	define: {
		global: 'globalThis',
	},
	resolve: {
		tsconfigPaths: true,
		alias: {
			buffer: 'buffer/',
		},
	},
	optimizeDeps: {
		include: ['buffer', 'iconv-lite'],
	},
	plugins: [
		tailwindcss(),
		tanstackStart({
			spa: {
				enabled: true,
				prerender: {
					outputPath: '/index.html',
				},
			},
		}),
		viteReact({
			compiler: true,
		}),
	],
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		passWithNoTests: true,
	},
});
