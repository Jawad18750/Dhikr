import { clientConfig } from '@/utils';

import type { SeoLocale } from './routes';

const appUrl = clientConfig.APP_URL.replace(/\/+$/, '');

export const SITE = {
  name: clientConfig.APP_NAME,
  url: appUrl,
  ogImage: '/opengraph-image.png',
  logo: '/images/icon-512.png',
  verification: process.env.GOOGLE_SITE_VERIFICATION,
} as const;

/** The site's name in each locale: «ذكر» in Arabic, Dhikr in Latin script. */
export const BRAND: Record<SeoLocale, string> = {
  ar: 'ذكر',
  en: 'Dhikr',
  fr: 'Dhikr',
  de: 'Dhikr',
  es: 'Dhikr',
  tr: 'Dhikr',
  id: 'Dhikr',
  ms: 'Dhikr',
  ur: 'ذکر',
  fa: 'ذکر',
  bn: 'Dhikr',
  ru: 'Dhikr',
};

export const OG_LOCALES: Record<SeoLocale, string> = {
  ar: 'ar_AR',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  es: 'es_ES',
  tr: 'tr_TR',
  id: 'id_ID',
  ms: 'ms_MY',
  ur: 'ur_PK',
  fa: 'fa_IR',
  bn: 'bn_BD',
  ru: 'ru_RU',
};
