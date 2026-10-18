import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkIsInput,
  convertEventToMask,
  createCodeMap,
  createShortcuts,
  getKey,
  getMaskObject,
  isImeKeyEvent,
  isMac,
  maskToLabel,
  maskToPrimaryLabel,
  normalizeMask,
  pickPrimaryMask,
} from '.';

const dispatchKey = (type: 'keydown' | 'keyup', init: KeyboardEventInit & { code: string }) => {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init });
  document.dispatchEvent(event);
  return event;
};

describe('normalizeMask', () => {
  it('lowercases and strips spaces', () => {
    expect(normalizeMask('Ctrl + Z')).toBe('ctrl+z');
  });
});

describe('isImeKeyEvent', () => {
  it('false for plain keydown', () => {
    expect(isImeKeyEvent(new KeyboardEvent('keydown', { code: 'KeyZ', key: 'z' }))).toBe(false);
  });

  it('true when composing, keyCode 229, Process, Unidentified', () => {
    const composing = new KeyboardEvent('keydown', { code: 'KeyZ', key: 'z' });
    Object.defineProperty(composing, 'isComposing', { value: true });
    expect(isImeKeyEvent(composing)).toBe(true);
    expect(isImeKeyEvent(new KeyboardEvent('keydown', { keyCode: 229 }))).toBe(true);
    expect(isImeKeyEvent(new KeyboardEvent('keydown', { key: 'Process' }))).toBe(true);
    expect(isImeKeyEvent(new KeyboardEvent('keydown', { key: 'Unidentified' }))).toBe(true);
  });
});

describe('maskToPrimaryLabel', () => {
  const setNavigator = (props: Record<string, unknown>) => {
    Object.entries(props).forEach(([key, value]) => {
      Object.defineProperty(navigator, key, { value, configurable: true });
    });
  };

  afterEach(() => {
    setNavigator({ userAgentData: undefined, platform: 'Win32', userAgent: '' });
  });

  it('dual mask → ctrl label on non-Mac, meta label on Mac', () => {
    setNavigator({ userAgentData: { platform: 'Windows' } });
    expect(maskToPrimaryLabel('ctrl+shift+a,meta+shift+a')).toBe('Ctrl + Shift + a');

    setNavigator({ userAgentData: { platform: 'macOS' } });
    expect(maskToPrimaryLabel('ctrl+shift+a,meta+shift+a')).toBe('⌘ + Shift + a');
  });

  it('single mask — label as-is', () => {
    setNavigator({ userAgentData: { platform: 'Windows' } });
    expect(maskToPrimaryLabel('alt+q')).toBe('Alt + q');
  });
});

describe('getMaskObject / getKey', () => {
  const codeMap = createCodeMap();

  it('maps tab / shift+tab / arrows to event.code keys', () => {
    expect(getMaskObject('tab', codeMap)).toEqual({ code: 'Tab' });
    expect(getMaskObject('shift+tab', codeMap)).toEqual({ shift: true, code: 'Tab' });
    expect(getMaskObject('up', codeMap)).toEqual({ code: 'ArrowUp' });
    expect(getKey('hold', getMaskObject('tab', codeMap))).toBe('hold_Tab');
    expect(getKey('hold', getMaskObject('shift+tab', codeMap))).toBe('hold_shift_Tab');
    expect(getKey('hold', getMaskObject('ctrl+z', codeMap))).toBe('hold_ctrl_KeyZ');
  });
});

describe('checkIsInput', () => {
  it('accepts text-like input, textarea, and select', () => {
    const text = document.createElement('input');
    text.type = 'text';
    const search = document.createElement('input');
    search.type = 'search';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const area = document.createElement('textarea');
    const select = document.createElement('select');
    const option = document.createElement('option');
    const div = document.createElement('div');
    div.contentEditable = 'true';

    expect(checkIsInput(text)).toBe(true);
    expect(checkIsInput(search)).toBe(true);
    expect(checkIsInput(area)).toBe(true);
    expect(checkIsInput(select)).toBe(true);
    expect(checkIsInput(option)).toBe(true);
    expect(checkIsInput(checkbox)).toBe(false);
    expect(checkIsInput(div)).toBe(false);
    expect(checkIsInput(null)).toBe(false);
  });
});

describe('createShortcuts matching', () => {
  it('fires hold handler on keydown and respects preventDefault', () => {
    const shortcuts = createShortcuts();
    const handler = vi.fn();
    shortcuts.add({ mask: 'tab', type: 'hold', preventDefault: true, handler });
    shortcuts.start();

    const event = dispatchKey('keydown', { code: 'Tab', key: 'Tab' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);

    shortcuts.stop();
    shortcuts.removeAll();
  });

  it('fires down only once per physical key until keyup', () => {
    const shortcuts = createShortcuts();
    const downHandler = vi.fn();
    const holdHandler = vi.fn();
    shortcuts.add({ mask: 'f2', type: 'down', handler: downHandler });
    shortcuts.add({ mask: 'f2', type: 'hold', handler: holdHandler });
    shortcuts.start();

    dispatchKey('keydown', { code: 'F2', key: 'F2' });
    dispatchKey('keydown', { code: 'F2', key: 'F2', repeat: true });
    expect(downHandler).toHaveBeenCalledTimes(1);
    expect(holdHandler).toHaveBeenCalledTimes(2);

    dispatchKey('keyup', { code: 'F2', key: 'F2' });
    dispatchKey('keydown', { code: 'F2', key: 'F2' });
    expect(downHandler).toHaveBeenCalledTimes(2);

    shortcuts.stop();
    shortcuts.removeAll();
  });

  it('skips handlers when target is a text input unless enableInInput', () => {
    const shortcuts = createShortcuts();
    const blocked = vi.fn();
    const allowed = vi.fn();
    shortcuts.add({ mask: 'enter', type: 'hold', handler: blocked });
    shortcuts.add({
      mask: 'esc',
      type: 'hold',
      enableInInput: true,
      handler: allowed,
    });
    shortcuts.start();

    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        code: 'Enter',
        key: 'Enter',
      }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        code: 'Escape',
        key: 'Escape',
      }),
    );

    expect(blocked).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledTimes(1);

    input.remove();
    shortcuts.stop();
    shortcuts.removeAll();
  });

  it('runs callback after hold matching', () => {
    const shortcuts = createShortcuts();
    const hold = vi.fn();
    const callback = vi.fn();
    shortcuts.add({ mask: 'a', type: 'hold', handler: hold });
    shortcuts.callback(callback);
    shortcuts.start();

    dispatchKey('keydown', { code: 'KeyA', key: 'a' });
    expect(hold).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();

    shortcuts.stop();
    shortcuts.removeAll();
  });
});

describe('meta modifier support', () => {
  const codeMap = createCodeMap();

  it('parses meta token into key string', () => {
    expect(getMaskObject('meta+b', codeMap)).toEqual({ meta: true, code: 'KeyB' });
    expect(getKey('hold', getMaskObject('meta+b', codeMap))).toBe('hold_meta_KeyB');
    expect(getKey('down', getMaskObject('ctrl+b', codeMap))).toBe('down_ctrl_KeyB');
    expect(getKey('down', getMaskObject('meta+alt+left', codeMap))).toBe('down_alt_meta_ArrowLeft');
  });

  it('meta alone does not produce a code key', () => {
    expect(getMaskObject('meta', codeMap)).toEqual({ meta: true });
    expect(getKey('down', getMaskObject('meta', codeMap))).toBe('down_meta');
  });

  it('convertEventToMask builds mask from event including meta', () => {
    const codeMap = createCodeMap();

    expect(
      convertEventToMask(
        { code: 'KeyK', key: 'k', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false },
        codeMap,
      ),
    ).toBe('ctrl+k');
    expect(
      convertEventToMask(
        { code: 'Slash', key: '/', ctrlKey: true, altKey: false, shiftKey: false, metaKey: true },
        codeMap,
      ),
    ).toBe('ctrl+meta+?');
    expect(
      convertEventToMask(
        { code: 'Space', key: ' ', ctrlKey: false, altKey: false, shiftKey: false, metaKey: true },
        codeMap,
      ),
    ).toBe('meta+space');
    expect(
      convertEventToMask(
        {
          code: 'ShiftLeft',
          key: 'Shift',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
        },
        codeMap,
      ),
    ).toBe('');
  });

  it('pickPrimaryMask picks platform main mask, maskToLabel renders kbd label', () => {
    const dual = 'ctrl+shift+a,meta+shift+a';
    expect(pickPrimaryMask(dual, true)).toBe('meta+shift+a');
    expect(pickPrimaryMask(dual, false)).toBe('ctrl+shift+a');
    expect(pickPrimaryMask('alt+q', true)).toBe('alt+q');
    expect(maskToLabel(pickPrimaryMask(dual, true))).toBe('⌘ + Shift + a');
    expect(maskToLabel(pickPrimaryMask(dual, false))).toBe('Ctrl + Shift + a');
    expect(maskToLabel('ctrl+up')).toBe('Ctrl + up');
  });

  it('dual mask fires ctrl and meta events, plain key does not', () => {
    const shortcuts = createShortcuts();
    const handler = vi.fn();
    shortcuts.add({ mask: 'ctrl+b,meta+b', type: 'down', handler });
    shortcuts.start();

    dispatchKey('keydown', { code: 'KeyB', key: 'b', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);

    dispatchKey('keyup', { code: 'KeyB', key: 'b' });
    dispatchKey('keydown', { code: 'KeyB', key: 'b', metaKey: true });
    expect(handler).toHaveBeenCalledTimes(2);

    dispatchKey('keyup', { code: 'KeyB', key: 'b' });
    dispatchKey('keydown', { code: 'KeyB', key: 'b' });
    expect(handler).toHaveBeenCalledTimes(2);

    shortcuts.stop();
    shortcuts.removeAll();
  });
});

describe('isMac', () => {
  const setNavigator = (props: Record<string, unknown>) => {
    Object.entries(props).forEach(([key, value]) => {
      Object.defineProperty(navigator, key, { value, configurable: true });
    });
  };

  afterEach(() => {
    setNavigator({ userAgentData: undefined, platform: 'Win32', userAgent: '' });
  });

  it('prefers userAgentData platform over navigator.platform — Windows webview reports Windows', () => {
    setNavigator({ platform: 'MacIntel', userAgentData: { platform: 'Windows' } });
    expect(isMac()).toBe(false);
  });

  it('userAgentData macOS — true', () => {
    setNavigator({ userAgentData: { platform: 'macOS' } });
    expect(isMac()).toBe(true);
  });

  it('no userAgentData — falls back to UA string', () => {
    setNavigator({
      userAgentData: undefined,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    });
    expect(isMac()).toBe(true);
    setNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)' });
    expect(isMac()).toBe(false);
  });
});
