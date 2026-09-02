// isJQuery/toElement — jQuery 제거 완료 시 삭제 가능

const eventStore = new WeakMap();

const getStore = (target) => {
	if (!eventStore.has(target)) eventStore.set(target, new Map());
	return eventStore.get(target);
};

const makeKey = (type, namespace, selector = null) =>
	selector == null
		? `${type}::${namespace}`
		: `${type}::${namespace}::delegate::${selector}`;

const parseEvent = (event) => {
	const dot = event.indexOf('.');
	if (dot === -1) return { type: event, namespace: '' };
	return { type: event.slice(0, dot), namespace: event.slice(dot + 1) };
};

/**
 * @typedef {Object} BindEventOptions
 * @property {EventTarget} target - 이벤트를 등록할 DOM 요소
 * @property {string} event - DOM 이벤트 타입. jQuery 호환 `'resize.sh'` 형식이면 dot 뒤를 namespace로 파싱
 * @property {(event: Event, matched?: Element) => void} handler - 이벤트 핸들러. `selector`가 있으면 두 번째 인자로 매칭된 자식 요소 전달
 * @property {string} [selector] - 지정 시 이벤트 위임. `target` 하위에서 `closest(selector)`로 매칭된 요소만 handler 호출
 */

/**
 * DOM 이벤트를 등록한다. 동일한 `target`·`event`·namespace·`selector` 조합이 이미 있으면
 * 이전 리스너를 제거한 뒤 새 handler로 교체한다 (jQuery `.off().on()`과 동일한 목적).
 *
 * @param {BindEventOptions} options
 * @example
 * bindEvent({ target: form, event: 'submit', handler: () => { ... } });
 * @example
 * bindEvent({ target: window, event: 'resize.sh', handler: () => { ... } });
 * @example
 * bindEvent({
 *   target: list,
 *   event: 'click',
 *   selector: '.btn-change',
 *   handler: (event, button) => { ... },
 * });
 */
export const bindEvent = ({ target, event, handler, selector }) => {
	if (!target || !handler) return;
	const { type, namespace } = parseEvent(event);
	const key = makeKey(type, namespace, selector ?? null);
	const store = getStore(target);
	const previous = store.get(key);
	if (previous) target.removeEventListener(type, previous);

	const listener = selector
		? (domEvent) => {
			const matched = domEvent.target.closest(selector);
			if (!matched || !target.contains(matched)) return;
			handler(domEvent, matched);
		}
		: handler;

	store.set(key, listener);
	target.addEventListener(type, listener);
};

export const isJQuery = (value) => value != null && value.jquery != null;

export const toElement = (value) => (isJQuery(value) ? value[0] : value);
