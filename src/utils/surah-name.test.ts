import { describe, expect, it } from 'vitest';

import type { Surah } from '@/types/surah';

import { getSurahDisplayName } from './surah-name';

const fatiha: Surah = {
  id: 1,
  name: 'سُورَةُ ٱلْفَاتِحَةِ',
  englishName: 'Al-Fatihah',
  germanName: 'Die Eröffnung',
  revelationType: 'Meccan',
  ayahCount: 7,
};

describe('getSurahDisplayName', () => {
  it('selects the German title for the de locale', () => {
    expect(getSurahDisplayName(fatiha, 'de')).toBe('Die Eröffnung');
  });

  it('selects the English title for the en locale', () => {
    expect(getSurahDisplayName(fatiha, 'en')).toBe('Al-Fatihah');
  });

  it('uses tashkeel-stripped Arabic in Arabic script languages', () => {
    expect(getSurahDisplayName(fatiha, 'ar')).toBe('سورة الفاتحة');
    expect(getSurahDisplayName(fatiha, 'ur')).toBe('سورة الفاتحة');
    expect(getSurahDisplayName(fatiha, 'fa')).toBe('سورة الفاتحة');
  });

  it('uses the English title in other languages', () => {
    expect(getSurahDisplayName(fatiha, 'fr')).toBe(fatiha.englishName);
  });
});
