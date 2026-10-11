import { useLayoutEffect, useRef } from 'react';

/** commit(layout) 시점 ref 동기화 — 이벤트 핸들러는 commit 후 실행이므로 ref가 최신 */
const useLatestRef = <T>(value: T) => {
	const ref = useRef(value);
	useLayoutEffect(() => {
		ref.current = value;
	});
	return ref;
};

export { useLatestRef };
