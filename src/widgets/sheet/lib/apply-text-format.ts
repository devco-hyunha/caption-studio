import { encodeCellHtml } from './encode-cell-html';

export type TextFormatCommand = 'bold' | 'italic' | 'underline';

const FORMAT_TAGS: Record<TextFormatCommand, 'b' | 'i' | 'u'> = {
	bold: 'b',
	italic: 'i',
	underline: 'u',
};

/**
 * selectAll + execCommand 토글의 단순 근사 — 전체가 한 태그로 감싸면 해제, 아니면 감쌈.
 * (jsdom 등 execCommand 미지원 환경·단위 테스트용)
 */
const toggleWrapTag = (html: string, tag: 'b' | 'i' | 'u'): string => {
	const trimmed = html.trim();
	const wrapped = new RegExp(`^<${tag}>([\\s\\S]*)</${tag}>$`, 'i').exec(trimmed);
	if (wrapped) return wrapped[1] ?? '';
	if (!html) return `<${tag}></${tag}>`;
	return `<${tag}>${html}</${tag}>`;
};

/**
 * 레거시 multiClip(selectAll → execCommand → encode) parity.
 * 문서에 임시 contenteditable을 붙여 bold/italic/underline을 토글한다.
 */
const applyTextFormatCommand = (html: string, command: TextFormatCommand): string => {
	if (typeof document === 'undefined') {
		return toggleWrapTag(html, FORMAT_TAGS[command]);
	}

	const host = document.createElement('div');
	host.contentEditable = 'true';
	host.setAttribute('aria-hidden', 'true');
	host.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;';
	host.innerHTML = html || '';
	document.body.appendChild(host);

	try {
		host.focus();
		const selection = window.getSelection();
		if (selection) {
			const range = document.createRange();
			range.selectNodeContents(host);
			selection.removeAllRanges();
			selection.addRange(range);
		}

		const supported =
			typeof document.execCommand === 'function' &&
			document.execCommand(command, false);

		if (!supported) {
			host.innerHTML = toggleWrapTag(html, FORMAT_TAGS[command]);
		}

		return encodeCellHtml(host);
	} finally {
		host.remove();
	}
};

export { applyTextFormatCommand, toggleWrapTag };
