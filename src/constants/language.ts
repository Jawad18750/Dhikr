export const LANGUAGES = {
  ar: {
    label: 'العربية',
  },
  en: {
    label: 'English',
  },
  fr: { label: 'Français' },
  de: {
    label: 'Deutsch',
  },
  es: { label: 'Español' },
  tr: { label: 'Türkçe' },
  id: { label: 'Bahasa Indonesia' },
  ms: { label: 'Bahasa Melayu' },
  ur: { label: 'اردو' },
  fa: { label: 'فارسی' },
  bn: { label: 'বাংলা' },
  ru: { label: 'Русский' },
} as const;

export type Language = keyof typeof LANGUAGES;
