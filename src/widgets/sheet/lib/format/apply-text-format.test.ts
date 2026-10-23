import { describe, expect, it } from 'vitest';
import { applyTextFormatCommand, toggleWrapTag } from './apply-text-format';

describe('toggleWrapTag', () => {
  it('감싸지 않은 텍스트에 bold 태그를 붙인다', () => {
    expect(toggleWrapTag('hello', 'b')).toBe('<b>hello</b>');
  });

  it('이미 전체가 감싸진 경우 해제한다', () => {
    expect(toggleWrapTag('<b>hello</b>', 'b')).toBe('hello');
  });

  it('빈 문자열은 빈 태그로 감싼다', () => {
    expect(toggleWrapTag('', 'u')).toBe('<u></u>');
  });
});

describe('applyTextFormatCommand', () => {
  it('bold를 적용하면 b 태그가 포함된다', () => {
    const next = applyTextFormatCommand('hello', 'bold');
    expect(next.toLowerCase()).toContain('hello');
    expect(next.toLowerCase()).toMatch(/<b>|<strong>/);
  });

  it('같은 명령을 다시 적용하면 토글된다', () => {
    const once = applyTextFormatCommand('hello', 'italic');
    const twice = applyTextFormatCommand(once, 'italic');
    expect(twice.toLowerCase()).not.toMatch(/^<i>.*<\/i>$/);
  });

  it('underline는 u 태그를 산출한다', () => {
    const next = applyTextFormatCommand('abc', 'underline');
    expect(next.toLowerCase()).toMatch(/<u>|<span style="text-decoration:underline">/);
  });

  it('colorClear는 font color 태그를 제거한다 (jsdom 폴백)', () => {
    const next = applyTextFormatCommand('<font color="#ff0000">hello</font>', 'colorClear');
    expect(next.toLowerCase()).not.toContain('font');
    expect(next.toLowerCase()).toContain('hello');
  });
});
