const createEditHistory = () => {
	const history = {
		index: -1,
		entries: [],
		prev() {
			const currentIndex = history.index;
			if (currentIndex >= -1) {
				history.index -= 1;
			}
			return history.entries[history.index + 1];
		},
		next() {
			if (history.index < history.entries.length - 1) {
				history.index += 1;
			}
			return history.entries[history.index];
		},
		current() {
			return history.entries[history.index] === undefined ? [] : history.entries[history.index];
		},
		latest() {
			history.index = history.entries.length - 1;
			return history.entries[history.index] === undefined ? [] : history.entries[history.index];
		},
		push(entry) {
			if (history.index !== history.entries.length - 1) {
				history.entries = history.entries.slice(0, history.index + 1);
			}
			history.entries.push(entry);
			history.index = history.entries.length - 1;
			return false;
		},
		clear() {
			history.index = -1;
			history.entries = [];
		},
		getState() {
			return {
				entries: history.entries.slice(),
				index: history.index,
			};
		},
		setState(state) {
			history.entries = Array.isArray(state?.entries) ? state.entries.slice() : [];
			history.index = typeof state?.index === 'number' ? state.index : -1;
		},
	};

	return history;
};

const editHistory = createEditHistory();

export { editHistory };
