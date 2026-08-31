const capitalize = (text) => {
	return text[0].toUpperCase() + text.slice(1);
};

const padZero = (value, length) => {
	return String(value).padStart(length, '0');
};

export { capitalize, padZero };
