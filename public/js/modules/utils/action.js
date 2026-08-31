const resolveAction = (path, context) => {
	if (!path || typeof path !== 'string') return undefined;
	return path.split('.').reduce((target, key) => {
		if (target == null) return undefined;
		return target[key];
	}, context);
};

export const runAction = (path, context, ...args) => {
	const fn = resolveAction(path, context);
	if (typeof fn === 'function') fn(...args);
};
