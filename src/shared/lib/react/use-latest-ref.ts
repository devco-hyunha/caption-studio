import { useRef } from 'react';

/** 렌더 시점 ref 동기화 — 이벤트 핸들러는 commit 후 실행이므로 렌더 시점 ref가 최신 */
const useLatestRef = <T>(value: T) => {
	const ref = useRef(value);
	ref.current = value;
	return ref;
};

export { useLatestRef };
