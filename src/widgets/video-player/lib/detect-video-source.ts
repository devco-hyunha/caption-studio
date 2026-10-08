import type { VideoSourceKind } from '../types';

const YOUTUBE_RE =
	/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO_RE = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;

const detectVideoSourceKind = (raw: string): VideoSourceKind => {
	const value = raw.trim();
	if (!value) return 'url';
	if (YOUTUBE_RE.test(value)) return 'youtube';
	if (VIMEO_RE.test(value)) return 'vimeo';
	return 'url';
};

const canAcceptVideoFile = (file: File): boolean => {
	if (file.type.startsWith('video/')) return true;
	return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(file.name);
};

export { YOUTUBE_RE, VIMEO_RE, canAcceptVideoFile, detectVideoSourceKind };
