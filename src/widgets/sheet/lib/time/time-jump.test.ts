import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_JUMP_MS,
  nudgeTimelineByStep,
  nudgeTimelineColumn,
  readTimeJumpMs,
} from './time-jump';

afterEach(() => {
  localStorage.clear();
});

describe('readTimeJumpMs', () => {
  it('없으면 기본 30ms', () => {
    expect(readTimeJumpMs()).toBe(DEFAULT_JUMP_MS);
    expect(DEFAULT_JUMP_MS).toBe(30);
  });

  it('`/` storage.set은 JSON 문자열 — parse 후 parseInt', () => {
    localStorage.setItem('jump_val', JSON.stringify('50'));
    expect(readTimeJumpMs()).toBe(50);

    localStorage.setItem('jump_val', JSON.stringify(100));
    expect(readTimeJumpMs()).toBe(100);
  });

  it('corrupt·빈 값은 기본값', () => {
    localStorage.setItem('jump_val', '{corrupt');
    expect(readTimeJumpMs()).toBe(DEFAULT_JUMP_MS);

    localStorage.setItem('jump_val', '""');
    expect(readTimeJumpMs()).toBe(DEFAULT_JUMP_MS);

    localStorage.setItem('jump_val', JSON.stringify('abc'));
    expect(readTimeJumpMs()).toBe(DEFAULT_JUMP_MS);
  });
});

describe('nudgeTimelineByStep (다중 선택 — start/end 둘 다)', () => {
  it('plus는 start/end +step', () => {
    const next = nudgeTimelineByStep({ start: 100, end: 200, text: 'a' }, 30, 'plus');
    expect(next.start).toBe(130);
    expect(next.end).toBe(230);
    expect(next.text).toBe('a');
  });

  it('minus는 start/end −step, 0 clamp', () => {
    const next = nudgeTimelineByStep({ start: 10, end: 20, text: 'a' }, 30, 'minus');
    expect(next.start).toBe(0);
    expect(next.end).toBe(0);
  });

  it('end가 없으면(0 falsy) end는 건드리지 않음 (`/` multiClip parity)', () => {
    const next = nudgeTimelineByStep({ start: 100, text: 'a' }, 30, 'plus');
    expect(next.start).toBe(130);
    expect(next.end).toBeUndefined();

    const minus = nudgeTimelineByStep({ start: 100, end: 0, text: 'a' }, 30, 'minus');
    expect(minus.start).toBe(70);
    expect(minus.end).toBe(0);
  });

  it('원본은 변경하지 않는다 (clone)', () => {
    const source = { start: 100, end: 200, text: 'a' };
    nudgeTimelineByStep(source, 30, 'plus');
    expect(source.start).toBe(100);
    expect(source.end).toBe(200);
  });
});

describe('nudgeTimelineColumn (단건 — 포커스 열만)', () => {
  it('starttime plus는 start만 +step', () => {
    const next = nudgeTimelineColumn({ start: 100, end: 200, text: 'a' }, 'starttime', 30, 'plus');
    expect(next.start).toBe(130);
    expect(next.end).toBe(200);
  });

  it('endtime minus는 end만 −step, 0 clamp', () => {
    const next = nudgeTimelineColumn({ start: 100, end: 20, text: 'a' }, 'endtime', 30, 'minus');
    expect(next.start).toBe(100);
    expect(next.end).toBe(0);
  });

  it('minus는 값이 0이면 변화 없음 (`/` timeMinus parity)', () => {
    const next = nudgeTimelineColumn({ start: 0, end: 0, text: 'a' }, 'starttime', 30, 'minus');
    expect(next.start).toBe(0);
  });
});
