import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/** 시트 데이터 본문 HTML 문자열 — 그 외 타입은 빈 문자열 */
export const asHtmlString = (value: unknown): string => (typeof value === 'string' ? value : '');
