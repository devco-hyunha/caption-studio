import { describe, expect, it } from 'vitest';
import { encodeCellHtml, resolveCommitValue } from './encode-cell-html';

describe('encodeCellHtml (entities encodeHtml 위임)', () => {
  it('color 속성은 보존, style·나머지 속성은 제거한다', () => {
    const el = document.createElement('div');
    el.innerHTML = '<font color="#ff0000" data-x="1">hi</font>';
    const out = encodeCellHtml(el);
    expect(out).toContain('color="#ff0000"');
    expect(out).not.toContain('data-x');
  });

  it('원본 DOM을 변형하지 않는다 (clone)', () => {
    const el = document.createElement('div');
    el.innerHTML = '<font color="#00ff00" data-x="1">hi</font>';
    const before = el.innerHTML;
    encodeCellHtml(el);
    expect(el.innerHTML).toBe(before);
  });

  it('trailing `<br>` 한 개를 제거한다', () => {
    const el = document.createElement('div');
    el.innerHTML = 'A<br>B<br>';
    expect(encodeCellHtml(el)).toBe('A<br>B');
  });

  it('null/undefined는 빈 문자열', () => {
    expect(encodeCellHtml(null)).toBe('');
    expect(encodeCellHtml(undefined)).toBe('');
  });
});

describe('resolveCommitValue', () => {
  it('text/memo keeps encoded HTML as-is', () => {
    expect(resolveCommitValue('text', 'A<br>B', 'A\nB')).toBe('A<br>B');
    expect(resolveCommitValue('memo', '<b>hi</b>', 'hi')).toBe('<b>hi</b>');
  });

  it('time columns use innerText trim, fall back to encoded', () => {
    expect(resolveCommitValue('starttime', ' 00:00:01.000 ', ' 00:00:01.000 ')).toBe(
      '00:00:01.000',
    );
    expect(resolveCommitValue('dur', '00:00:01.000')).toBe('00:00:01.000');
    expect(resolveCommitValue('index', ' 2 ')).toBe('2');
  });
});
