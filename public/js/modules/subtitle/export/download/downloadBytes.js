/**
 * 인코딩된 바이트를 파일로 저장한다.
 *
 * @param {string} filename
 * @param {Uint8Array} bytes
 */
const downloadBytes = (filename, bytes) => {
	const blob = new Blob([bytes], { type: 'application/octet-stream' });
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = objectUrl;
	link.download = filename;
	link.rel = 'noopener';
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export { downloadBytes };
