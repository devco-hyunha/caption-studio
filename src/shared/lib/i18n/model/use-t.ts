import { useLocaleStore } from './use-locale-store';

/**
 * 라벨 소비 seam — locale store를 구독해 locale 변경 시 리렌더.
 * SSR·교체는 이 hook 한 곳만 수정한다.
 */
const useT = (key: string): string => useLocaleStore((state) => state.t(key));

export { useT };
