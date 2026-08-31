const storage = () => {
	const get = (key) => JSON.parse(localStorage.getItem(key));

	const set = (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	};

	const remove = (key) => {
		localStorage.removeItem(key);
		return true;
	};

	return { get, set, remove };
};

export default storage;
