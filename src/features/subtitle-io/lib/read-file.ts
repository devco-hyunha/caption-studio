/**
 * FileReader.readAsText.
 * BOM(UTF-16 LE/BE 등)은 브라우저가 encoding 인자보다 우선 감지한다.
 */
const readFileText = (file: File, encoding: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
				return;
			}
			reject(new Error('Failed to read file as text'));
		};
		reader.onerror = () => {
			reject(reader.error ?? new Error('FileReader error'));
		};
		reader.readAsText(file, encoding || 'UTF-8');
	});

export { readFileText };
