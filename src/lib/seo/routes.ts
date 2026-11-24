export const LOCALES = ['ar', 'en', 'fr', 'de', 'es', 'tr', 'id', 'ms', 'ur', 'fa', 'bn', 'ru'] as const;

export type SeoLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: SeoLocale = 'ar';

/** Languages written right to left. */
export const RTL_LOCALES: ReadonlySet<SeoLocale> = new Set<SeoLocale>(['ar', 'ur', 'fa']);

export const isRtl = (locale: string): boolean => RTL_LOCALES.has(locale as SeoLocale);

/** Each language by its own name, for the language menu. */
export const LOCALE_NAMES: Record<SeoLocale, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  ur: 'اردو',
  fa: 'فارسی',
  bn: 'বাংলা',
  ru: 'Русский',
};

export type SeoRoute = {
  name: string;
  path: string;
  index: boolean;
  sitemap: boolean;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  dynamic?: boolean;
  /** An Arabic document only: its addresses in the other languages redirect to it. */
  arabicOnly?: boolean;
};

/**
 * The one place a public path exists.
 *
 * Metadata, the sitemap, links and the SEO tests read this table. A page that is
 * not here cannot be announced or indexed.
 */
export const ROUTES: readonly SeoRoute[] = [
  {
    name: 'home',
    path: '/',
    index: true,
    sitemap: true,
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    name: 'about',
    path: '/about',
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    name: 'contact',
    path: '/contact',
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    name: 'privacy',
    path: '/privacy',
    index: true,
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    name: 'reciter',
    path: '/reciter/[id]',
    index: true,
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    dynamic: true,
  },
  {
    name: 'surahs',
    path: '/surahs',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    name: 'developers',
    path: '/developers',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    name: 'library',
    path: '/library',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.6,
  },
  {
    name: 'tafsir',
    path: '/tafsir',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    name: 'tafsir-book',
    path: '/tafsir/[id]',
    arabicOnly: true,
    index: true,
    sitemap: false,
    changeFrequency: 'monthly',
    priority: 0.5,
    dynamic: true,
  },
  {
    name: 'mawsuah',
    path: '/mawsuah',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    name: 'mawsuah-topic',
    path: '/mawsuah/[id]',
    arabicOnly: true,
    index: true,
    sitemap: false,
    changeFrequency: 'monthly',
    priority: 0.5,
    dynamic: true,
  },
  {
    name: 'prayer-times',
    path: '/prayer-times',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    name: 'prayer-methods',
    path: '/prayer-methods',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    name: 'qibla',
    path: '/qibla',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'yearly',
    priority: 0.6,
  },
  {
    name: 'hadith',
    path: '/hadith',
    arabicOnly: true,
    index: true,
    sitemap: true,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    name: 'hadith-collection',
    path: '/hadith/[slug]',
    arabicOnly: true,
    index: true,
    sitemap: false,
    changeFrequency: 'monthly',
    priority: 0.5,
    dynamic: true,
  },
  {
    name: 'ayah',
    path: '/ayah/[surah]/[ayah]',
    arabicOnly: true,
    index: true,
    sitemap: false,
    changeFrequency: 'monthly',
    priority: 0.5,
    dynamic: true,
  },
  {
    name: 'library-book',
    path: '/library/[book]',
    arabicOnly: true,
    index: true,
    sitemap: false,
    changeFrequency: 'monthly',
    priority: 0.5,
    dynamic: true,
  },
  {
    name: 'search',
    path: '/search',
    arabicOnly: true,
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
  {
    name: 'account',
    path: '/account',
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
  {
    name: 'admin',
    path: '/admin',
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
  {
    name: 'surah',
    path: '/surah/[id]',
    index: true,
    sitemap: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    dynamic: true,
  },
  {
    name: 'settings',
    path: '/settings',
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
  {
    name: 'offline',
    path: '/offline',
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
  {
    name: 'design-preview',
    path: '/design-preview',
    index: false,
    sitemap: false,
    changeFrequency: 'yearly',
    priority: 0,
  },
] as const;

const PREFIXED = new Set<string>(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE));

const normalize = (path: string): string => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

/** The path with the locale prefix the public URL uses. Arabic is bare. */
export const withLocale = (locale: SeoLocale, path: string): string => {
  const normalized = normalize(path);
  if (locale === DEFAULT_LOCALE) return normalized;

  const prefix = `/${locale}`;
  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized;
  }
  return normalized === '/' ? prefix : `${prefix}${normalized}`;
};

/** The first segment, when it is a supported locale. */
export const localeFromPath = (path: string): SeoLocale => {
  const segment = normalize(path).split('/')[1];
  return segment && PREFIXED.has(segment)
    ? (segment as SeoLocale)
    : DEFAULT_LOCALE;
};

/** The route path without its locale prefix. */
export const stripLocale = (path: string): string => {
  const normalized = normalize(path);
  const locale = localeFromPath(normalized);
  if (locale === DEFAULT_LOCALE) return normalized;

  const stripped = normalized.slice(locale.length + 1);
  return stripped || '/';
};

/** The language twins for a path, including x-default. */
export const alternatesFor = (
  path: string
): Record<SeoLocale | 'x-default', string> => {
  const bare = stripLocale(path);
  const out = { 'x-default': withLocale(DEFAULT_LOCALE, bare) } as Record<
    SeoLocale | 'x-default',
    string
  >;
  for (const locale of LOCALES) out[locale] = withLocale(locale, bare);
  return out;
};

const matchesRoute = (route: SeoRoute, barePath: string): boolean => {
  if (route.dynamic) {
    const prefix = route.path.replace(/\[[^\]]+\]/g, '');
    return barePath.startsWith(prefix);
  }
  return route.path === barePath;
};

/** Whether a public path is allowed to rank. */
export const isIndexable = (path: string): boolean => {
  const bare = stripLocale(path);
  const route = ROUTES.find((candidate) => matchesRoute(candidate, bare));
  return route?.index ?? false;
};

/** The route row for a public path, if one exists. */
export const routeForPath = (path: string): SeoRoute | undefined => {
  const bare = stripLocale(path);
  return ROUTES.find((candidate) => matchesRoute(candidate, bare));
};
