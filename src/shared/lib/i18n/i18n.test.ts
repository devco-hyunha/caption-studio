import { beforeEach, describe, expect, it } from 'vitest';
import { useLocaleStore } from './model/use-locale-store';
import { dictionaries } from './dictionaries/dictionaries';
import { DICTIONARY_KEYS } from './dictionaries/keys';
import {
  STORAGE_KEY_LEGACY_LANGUAGE,
  STORAGE_KEY_LOCALE,
  localeToSmiLang,
  migrateLanguage,
} from './model/migrate';

describe('migrateLanguage', () => {
  it('신 로케일 ko/en/ja는 그대로', () => {
    expect(migrateLanguage('ko')).toBe('ko');
    expect(migrateLanguage('en')).toBe('en');
    expect(migrateLanguage('ja')).toBe('ja');
  });

  it('구 KRCC/ENCC/JPCC를 로케일로 승격', () => {
    expect(migrateLanguage('KRCC')).toBe('ko');
    expect(migrateLanguage('ENCC')).toBe('en');
    expect(migrateLanguage('JPCC')).toBe('ja');
  });

  it('비문자열·빈 문자열·미매칭은 ko 기본값', () => {
    expect(migrateLanguage('')).toBe('ko');
    expect(migrateLanguage(null)).toBe('ko');
    expect(migrateLanguage('fr')).toBe('ko');
  });
});

describe('localeToSmiLang', () => {
  it('UI 로케일 → SMI STYLE lang (BCP-47)', () => {
    expect(localeToSmiLang('ko')).toBe('ko-KR');
    expect(localeToSmiLang('en')).toBe('en-US');
    expect(localeToSmiLang('ja')).toBe('ja-JP');
  });
});

describe('useLocaleStore — t() · setLanguage', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  it('locale ko — ko 사전 라벨', () => {
    expect(useLocaleStore.getState().t('toolbar.undo')).toBe('실행취소');
  });

  it('setLanguage(en) — 사전 전환', () => {
    useLocaleStore.getState().setLanguage('en');
    expect(useLocaleStore.getState().locale).toBe('en');
    expect(useLocaleStore.getState().t('toolbar.undo')).toBe('Undo');
  });

  it('ENCC로 setLanguage — 승격 후 en 사전', () => {
    useLocaleStore.getState().setLanguage('ENCC');
    expect(useLocaleStore.getState().locale).toBe('en');
    expect(useLocaleStore.getState().t('toolbar.redo')).toBe('Redo');
  });

  it('미등록 키는 key fallback', () => {
    expect(useLocaleStore.getState().t('no-such-key')).toBe('no-such-key');
  });

  it('3개 사전 키 집합 동일 — ko/en/ja 같은 키 수', () => {
    const koKeys = Object.keys(dictionaries.ko).sort();
    const enKeys = Object.keys(dictionaries.en).sort();
    const jaKeys = Object.keys(dictionaries.ja).sort();
    expect(enKeys).toEqual(koKeys);
    expect(jaKeys).toEqual(koKeys);
  });

  it('정본 DICTIONARY_KEYS — 3개 사전이 모든 키를 구현', () => {
    const canonical = [...DICTIONARY_KEYS].sort();
    expect(Object.keys(dictionaries.ko).sort()).toEqual(canonical);
    expect(Object.keys(dictionaries.en).sort()).toEqual(canonical);
    expect(Object.keys(dictionaries.ja).sort()).toEqual(canonical);
    for (const key of DICTIONARY_KEYS) {
      expect(dictionaries.ko[key]).toBeTypeOf('string');
      expect(dictionaries.en[key]).toBeTypeOf('string');
      expect(dictionaries.ja[key]).toBeTypeOf('string');
    }
  });
});

describe('locale 영속 키', () => {
  it('`locale` · `language` 키 상수', () => {
    expect(STORAGE_KEY_LOCALE).toBe('locale');
    expect(STORAGE_KEY_LEGACY_LANGUAGE).toBe('language');
  });
});
