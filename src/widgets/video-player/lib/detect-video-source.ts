import type { VideoSourceKind } from '../types';

const detectVideoSourceKind = (raw: string): VideoSourceKind => {
  const value = raw.trim();
  if (!value) return 'url';

  const youtubeRe =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
  const vimeoRe = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;

  if (youtubeRe.test(value)) return 'youtube';
  if (vimeoRe.test(value)) return 'vimeo';
  return 'url';
};

const canAcceptVideoFile = (file: File): boolean => {
  if (file.type.startsWith('video/')) return true;
  return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(file.name);
};

export { canAcceptVideoFile, detectVideoSourceKind };
