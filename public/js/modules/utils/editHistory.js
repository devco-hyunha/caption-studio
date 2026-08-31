const editHistory = () => {
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
	};

	return history;
};

export default editHistory;
