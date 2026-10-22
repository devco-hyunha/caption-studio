import type { StateStorage } from 'zustand/middleware';
import {
  DEFAULT_ENCODING,
  DEFAULT_EXPORT_ENCODING_SMI,
  DEFAULT_EXPORT_ENCODING_SRT,
  DEFAULT_EXPORT_ENCODING_VTT,
} from '@/entities/subtitle';
import { ENCODING_KEYS } from './constants';
import type { EncodingKey, EncodingState } from '../types';

/** 영속 스토어 name — persist payload 래퍼 marker (실제 저장은 개별 localStorage 키) */
const STORAGE_KEY_IO = 'subtitleIo';

const DEFAULT_STATE: EncodingState = {
  smiEncode: DEFAULT_ENCODING,
  srtEncode: DEFAULT_ENCODING,
  smiEncodeFile: DEFAULT_EXPORT_ENCODING_SMI,
  srtEncodeFile: DEFAULT_EXPORT_ENCODING_SRT,
  vttEncodeFile: DEFAULT_EXPORT_ENCODING_VTT,
};

/** localStorage 개별 키 JSON 문자열 → 문자열. corrupt는 기본값 */
const readEncodingKey = (key: EncodingKey): string => {
  if (typeof window === 'undefined') return DEFAULT_STATE[key];
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null || raw === '') return DEFAULT_STATE[key];
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === 'string' && parsed !== '' ? parsed : DEFAULT_STATE[key];
  } catch {
    return DEFAULT_STATE[key];
  }
};

/** localStorage 키 5개 → 스토어 상태 */
const loadState = (): EncodingState => ({
  smiEncode: readEncodingKey('smiEncode'),
  srtEncode: readEncodingKey('srtEncode'),
  smiEncodeFile: readEncodingKey('smiEncodeFile'),
  srtEncodeFile: readEncodingKey('srtEncodeFile'),
  vttEncodeFile: readEncodingKey('vttEncodeFile'),
});

/** persist `{ state }` → localStorage 키별 JSON 문자열로 분해 저장 */
const saveState = (state: EncodingState) => {
  if (typeof window === 'undefined') return;
  for (const key of ENCODING_KEYS) {
    const value = state[key];
    if (typeof value !== 'string' || value === '') continue;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota / private mode — 무시
    }
  }
};

/** Zustand persist `{ state }` 래퍼 — 개별 localStorage 키에 분해 영속 */
const createStorage = (): StateStorage => ({
  getItem: () => JSON.stringify({ state: loadState() }),
  setItem: (_name, value) => {
    try {
      const parsed = JSON.parse(value) as { state?: Partial<EncodingState> };
      if (!parsed.state) return;
      const state = mergeState(parsed.state, DEFAULT_STATE);
      saveState(state);
    } catch {
      // ignore corrupt persist payload
    }
  },
  removeItem: () => {
    if (typeof window === 'undefined') return;
    for (const key of ENCODING_KEYS) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
});

/** persisted partial → 상태. 불법 키·타입은 현행 유지 */
const mergeState = (persisted: Partial<EncodingState> | null, current: EncodingState) => {
  if (!persisted || typeof persisted !== 'object') return current;
  const next = { ...current };
  for (const key of ENCODING_KEYS) {
    const value = persisted[key];
    if (typeof value === 'string' && value !== '') {
      next[key] = value;
    }
  }
  return next;
};

export { DEFAULT_STATE, mergeState, loadState, STORAGE_KEY_IO, createStorage };
