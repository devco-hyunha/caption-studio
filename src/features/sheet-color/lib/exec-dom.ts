import { encodeHtml } from '@/entities/subtitle';

/**
 * 임의 contenteditable에 selectAll → execCommand(attr, value) → encode.
 * `encodeHtml(host, {clone:true, colorMode:'keep'})` — 시트 셀 encode와 동일 파형.
 * execCommand는 deprecated이나 현행 파형 유지.
 */
const execOnHtml = (
  html: string,
  attr: 'foreColor' | 'removeFormat',
  value: string | null,
): string => {
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
    document.execCommand(attr, false, value ?? undefined);
    return encodeHtml(host, { clone: true, colorMode: 'keep' });
  } finally {
    host.remove();
  }
};

export { execOnHtml };
