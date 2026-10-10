const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

/** Firefox는 insertLineBreak 미지원 — insertHTML로 줄바꿈 */
const insertEditorLineBreak = () => {
	if (isFirefox) {
		document.execCommand('insertHTML', false, '<br />');
		return;
	}
	document.execCommand('insertLineBreak');
};

interface PrintableKeyProbe {
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	key: string;
	code: string;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean };
}

/** 문자 키 (Space 포함). 커스텀 키·IME 조합 중이면 false */
const isPrintableKey = (event: PrintableKeyProbe): boolean => {
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (event.isComposing || event.nativeEvent?.isComposing) return false;
	return event.key.length === 1 || event.code === 'Space';
};

interface ImeKeyProbe {
	key: string;
	isComposing?: boolean;
	nativeEvent?: { isComposing?: boolean; keyCode?: number };
	keyCode?: number;
}

/** IME 조합 시작(한글 등) — Process/229 또는 composing */
const isImeStartKey = (event: ImeKeyProbe): boolean => {
	if (event.isComposing || event.nativeEvent?.isComposing) return true;
	if (event.key === 'Process') return true;
	const keyCode = event.nativeEvent?.keyCode ?? event.keyCode;
	return keyCode === 229;
};

/** 편집 진입 키 — Enter, IME 시작, 문자 키. Space는 다중 선택 토글이 선점 */
const shouldBeginEditFromKey = (event: PrintableKeyProbe & ImeKeyProbe): boolean => {
	if (event.key === 'Enter') return true;
	if (event.ctrlKey || event.altKey || event.metaKey) return false;
	if (isImeStartKey(event)) return true;
	return isPrintableKey(event);
};

export {
	isFirefox,
	insertEditorLineBreak,
	isPrintableKey,
	isImeStartKey,
	shouldBeginEditFromKey,
};
