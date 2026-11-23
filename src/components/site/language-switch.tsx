'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { IoGlobeOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { type SeoLocale, stripLocale, withLocale } from '@/lib/seo/routes';

/**
 * The other language, one round globe button. It goes to the same page in that
 * language (a full load: each language is its own document, its own direction).
 */
export function LanguageSwitch({ locale }: { locale: SeoLocale }) {
  const { formatMessage } = useIntl();
  const pathname = usePathname() ?? '/';
  const search = useSearchParams()?.toString();
  const other: SeoLocale = locale === 'ar' ? 'en' : 'ar';
  const bare = stripLocale(pathname);
  // Reciter and surah pages are Arabic documents (their twins lead back here), so the
  // other language opens on its home.
  const arabicOnly = /^\/(?:reciter\/|surah\/|(?:surahs|developers|account|admin)$)/.test(bare);
  const href = arabicOnly
    ? withLocale(other, '/')
    : `${withLocale(other, bare)}${search ? `?${search}` : ''}`;
  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={formatMessage({ id: 'nav.otherLanguage' })}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-[border-color,transform] duration-300 hover:border-border-strong active:scale-90"
    >
      <IoGlobeOutline className="h-[19px] w-[19px]" aria-hidden="true" />
    </a>
  );
}
