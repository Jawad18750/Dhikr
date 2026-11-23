import type { Language } from '@/constants/language';
import type { Surah } from '@/types/surah';

import { removeTashkeel } from './search';

/**
 * User-facing surah title for a UI locale: German titles for `de`, the Arabic name
 * (tashkeel stripped) in Arabic script languages, and the English title elsewhere. Centralizes the locale
 * selection so player and download-progress labels cannot drift apart.
 */
export const getSurahDisplayName = (
  surah: Surah,
  locale: Language | string
): string => {
  if (locale === 'de') return surah.germanName;
  if (locale === 'ar' || locale === 'ur' || locale === 'fa') return removeTashkeel(surah.name);
  return surah.englishName;
};

/** «7 آيات», «285 آية»: Arabic takes the plural from three to ten. */
export const ayahCountAr = (count: number) => `${count} ${count >= 3 && count <= 10 ? 'آيات' : 'آية'}`;
