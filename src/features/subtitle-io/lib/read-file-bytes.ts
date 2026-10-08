/** File → ArrayBuffer (iconv decode용) */
const readFileBytes = (file: File): Promise<ArrayBuffer> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (result instanceof ArrayBuffer) {
				resolve(result);
				return;
			}
			reject(new Error('Failed to read file as ArrayBuffer'));
		};
		reader.onerror = () => {
			reject(reader.error ?? new Error('FileReader error'));
		};
		reader.readAsArrayBuffer(file);
	});

export { readFileBytes };
