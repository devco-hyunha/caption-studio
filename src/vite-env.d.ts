/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly VITE_APP_URL: string;
	readonly VITE_PRODUCTION_HOST: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
