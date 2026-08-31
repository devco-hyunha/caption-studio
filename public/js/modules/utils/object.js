const clone = (value) => {
	if (typeof value !== 'object') return value;
	if (!value) return value;
	if (Object.prototype.toString.apply(value) === '[object Array]') {
		const result = [];
		for (let i = 0; i < value.length; i += 1) {
			result[i] = clone(value[i]);
		}
		return result;
	}
	const result = {};
	for (const key in value) {
		if (value.hasOwnProperty(key)) {
			result[key] = clone(value[key]);
		}
	}
	return result;
};

const extend = (target, source) => {
	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
};

export { clone, extend };
