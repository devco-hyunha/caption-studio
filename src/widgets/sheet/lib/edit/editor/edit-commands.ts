const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

/** Firefox는 insertLineBreak 미지원 — insertHTML로 줄바꿈 */
const insertEditorLineBreak = () => {
	if (isFirefox) {
		document.execCommand('insertHTML', false, '<br />');
		return;
	}
	document.execCommand('insertLineBreak');
};

export { insertEditorLineBreak };
