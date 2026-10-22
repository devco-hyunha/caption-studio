import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STATE, STORAGE_KEY_IO, loadState, mergeState, createStorage } from './storage';
import type { EncodingState } from '../types';

const setKey = (key: string, value: string) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

describe('subtitle-io 영속 storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('영속 name·기본값 — import UTF-8 / export SMI EUC-KR', () => {
    expect(STORAGE_KEY_IO).toBe('subtitleIo');
    expect(DEFAULT_STATE.smiEncode).toBe('UTF-8');
    expect(DEFAULT_STATE.smiEncodeFile).toBe('EUC-KR');
  });

  it('localStorage JSON 문자열 키를 읽는다', () => {
    setKey('smiEncodeFile', 'EUC-JP');
    const state = loadState();
    expect(state.smiEncodeFile).toBe('EUC-JP');
    expect(state.vttEncodeFile).toBe('UTF-8');
  });

  it('corrupt payload는 기본값', () => {
    window.localStorage.setItem('srtEncode', '{not json');
    expect(loadState().srtEncode).toBe('UTF-8');
  });

  it('persist setItem은 개별 localStorage 키에 분해 저장', () => {
    const storage = createStorage();
    storage.setItem!(
      STORAGE_KEY_IO,
      JSON.stringify({
        state: {
          smiEncode: 'UTF-8',
          srtEncode: 'EUC-CN',
          smiEncodeFile: 'EUC-KR',
          srtEncodeFile: 'UTF-8',
          vttEncodeFile: 'UTF-8',
        },
      }),
    );
    expect(JSON.parse(window.localStorage.getItem('srtEncode') ?? 'null')).toBe('EUC-CN');
    expect(JSON.parse(window.localStorage.getItem('smiEncodeFile') ?? 'null')).toBe('EUC-KR');
  });

  it('mergeState — 비정상 partial은 현행 유지', () => {
    const persisted = {
      smiEncode: 42,
      vttEncodeFile: 'EUC-JP',
    } as unknown as Partial<EncodingState>;
    const merged = mergeState(persisted, DEFAULT_STATE);
    expect(merged.vttEncodeFile).toBe('EUC-JP');
    expect(merged.smiEncode).toBe('UTF-8');
    expect(mergeState(null, DEFAULT_STATE)).toEqual(DEFAULT_STATE);
  });
});
