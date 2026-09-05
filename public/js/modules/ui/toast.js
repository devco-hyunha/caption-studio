/**
 * Toast 알림 함수를 생성한다.
 *
 * @returns {(params: {
 *   type: string,
 *   message?: string,
 *   title?: string,
 *   options?: object,
 * }) => void}
 */
const createToast = () => {
	const toastContainerId = 'toast-container';
	const defaultOptions = {
		width: '',
		displayDuration: 2000,
		fadeOutDuration: 800,
	};

	let toastContainer = null;

	const ensureToastContainer = () => {
		if (toastContainer) return toastContainer;

		toastContainer = document.querySelector(`#${toastContainerId}`);
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.id = toastContainerId;
			document.body.appendChild(toastContainer);
		}
		return toastContainer;
	};

	const createSection = (className, content) => {
		const section = document.createElement('div');
		section.className = className;
		section.append(content);
		return section;
	};

	const fadeOutToast = (toast, duration, onDone) => {
		toast.style.transition = `opacity ${duration}ms`;
		toast.style.opacity = '0';
		setTimeout(onDone, duration);
	};

	const show = ({ type, message, title, options = {} }) => {
		const mergedOptions = Object.assign({}, defaultOptions, options);
		const container = ensureToastContainer();
		if (mergedOptions.width) container.style.width = mergedOptions.width;

		const toast = document.createElement('div');
		toast.className = `toast toast-${type}`;
		if (title) toast.appendChild(createSection('toast-title', title));
		if (message) toast.appendChild(createSection('toast-message', message));

		if (mergedOptions.displayDuration > 0) {
			setTimeout(() => {
				fadeOutToast(toast, mergedOptions.fadeOutDuration, () => {
					toast.remove();
				});
			}, mergedOptions.displayDuration);
		}

		toast.addEventListener('click', () => {
			toast.remove();
		});
		container.prepend(toast);
	};

	return show;
};

export { createToast };
