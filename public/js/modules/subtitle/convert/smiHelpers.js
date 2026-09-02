import { encode } from '../encode.js';
import { valid } from '../valid.js';

const smiFromSmiString = (data) => {
	const result = [];
	const syncChunks = data.split(/<sync/i);

	syncChunks.forEach((chunk) => {
		const sync = new DOMParser()
			.parseFromString('<sync' + chunk + '</p></sync>', 'text/html')
			.querySelector('sync');
		if (!sync) return;

		const paragraphs = Array.from(sync.children).filter((child) => child.tagName === 'P');
		const start = sync.getAttribute('start');
		if (start != null && start !== '' && Number(start) >= 0){
			const text = encode(paragraphs[0]);
			result.push({
				start: Number(start),
				text,
				memo: ''
			});
		}
	});

	return result;
};

const smiFromSrtArray = (data) => {
	const result = [];
	let prevEnd;

	data.forEach(({ start, end, text, memo = '' }) => {
		if (prevEnd == start) {
			const lastItem = result.at(-1);
			lastItem.text = text;
			lastItem.memo = memo;
		} else {
			result.push({
				start,
				text,
				memo,
			});
		}

		result.push({
			start: Number(end),
			text: '',
			memo: ''
		});

		prevEnd = end;
	});

	return result;
};

const smiFromString = (data) =>
	data.split('\n').map((line) => ({
		start: 0,
		text: valid(line),
		memo: '',
	}));

export { smiFromSmiString, smiFromSrtArray, smiFromString };
