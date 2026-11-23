import { Riwaya } from '@/types';

import { Language } from './language';

const BASE = {
  ar: {
    Hafs: 'حفص',
    Warsh: 'ورش',
    Qaloon: 'قالون',
    Khalaf: 'خلف',
    AlBazzi: 'البزي',
    AlSoosi: 'السوسي',
    AlDooriKisai: 'الدوري (الكسائي)',
    AlDooriAbuAmr: 'الدوري (أبو عمرو)',
    Shuaba: 'شعبة',
    IbnZakwan: 'ابن ذكوان',
    Hisham: 'هشام',
    IbnJammaz: 'ابن جماز',
    Yaqoub: 'يعقوب',
  },
  en: {
    Hafs: 'Hafs',
    Warsh: 'Warsh',
    Qaloon: 'Qaloon',
    Khalaf: 'Khalaf',
    AlBazzi: 'Al-Bazzi',
    AlSoosi: 'Al-Soosi',
    AlDooriKisai: 'Al-Doori (Kisai)',
    AlDooriAbuAmr: 'Al-Doori (Abu Amr)',
    Shuaba: 'Shuaba',
    IbnZakwan: 'Ibn Zakwan',
    Hisham: 'Hisham',
    IbnJammaz: 'Ibn Jammaz',
    Yaqoub: 'Yaqoub',
  },
  de: {
    Hafs: 'Hafs',
    Warsh: 'Warsh',
    Qaloon: 'Qaloon',
    Khalaf: 'Khalaf',
    AlBazzi: 'Al-Bazzi',
    AlSoosi: 'Al-Soosi',
    AlDooriKisai: 'Al-Doori (Kisai)',
    AlDooriAbuAmr: 'Al-Doori (Abu Amr)',
    Shuaba: 'Shuaba',
    IbnZakwan: 'Ibn Zakwan',
    Hisham: 'Hisham',
    IbnJammaz: 'Ibn Jammaz',
    Yaqoub: 'Yaqoub',
  },
} satisfies Record<'ar' | 'en' | 'de', Record<keyof typeof Riwaya, string>>;

/** Riwaya names by UI language; languages in Latin script use the English spellings. */
export const RiwayaNameByLocale: Record<Language, Record<keyof typeof Riwaya, string>> = {
  ...BASE,
  fr: BASE.en,
  es: BASE.en,
  tr: BASE.en,
  id: BASE.en,
  ms: BASE.en,
  ur: BASE.ar,
  fa: BASE.ar,
  bn: BASE.en,
  ru: BASE.en,
};
