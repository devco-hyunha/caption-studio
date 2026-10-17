import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY_FORMAT } from './format-storage';
import { useSheetFormatStore } from './use-sheet-format-store';

/** 영속 `format` 키 — JSON 문자열(`"smi"`)로 저장 */
const writeStoredFormat = (format: string) => {
  localStorage.setItem(STORAGE_KEY_FORMAT, JSON.stringify(format));
};

describe('useSheetFormatStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSheetFormatStore.setState({ format: 'smi' });
  });

  it('storage가 비면 기본 smi', () => {
    useSheetFormatStore.persist.rehydrate();
    expect(useSheetFormatStore.getState().format).toBe('smi');
  });

  it('영속 `format` 키를 승격', () => {
    writeStoredFormat('srt');
    useSheetFormatStore.persist.rehydrate();
    expect(useSheetFormatStore.getState().format).toBe('srt');
  });

  it('setFormat는 JSON 문자열로 영속', () => {
    useSheetFormatStore.getState().setFormat('srt');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY_FORMAT) ?? 'null')).toBe('srt');
  });

  it('corrupt `format` payload falls back to default smi', () => {
    localStorage.setItem(STORAGE_KEY_FORMAT, '{not json');
    useSheetFormatStore.persist.rehydrate();
    expect(useSheetFormatStore.getState().format).toBe('smi');
  });

  it('non-format value falls back to current format', () => {
    localStorage.setItem(STORAGE_KEY_FORMAT, JSON.stringify('vtt'));
    useSheetFormatStore.persist.rehydrate();
    expect(useSheetFormatStore.getState().format).toBe('smi');
  });
});
