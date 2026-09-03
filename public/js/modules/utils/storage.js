const get = (key) => JSON.parse(localStorage.getItem(key));

const set = (key, value) => {
	localStorage.setItem(key, JSON.stringify(value));
	return true;
};

const remove = (key) => {
	localStorage.removeItem(key);
	return true;
};

const storage = { get, set, remove };

export { get, set, remove, storage };
