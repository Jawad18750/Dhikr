import Link from 'next/link';
import { IoSettingsOutline } from 'react-icons/io5';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { BrandMark } from './brand-mark';

const COPY = { ar, en, de } as const;

/** The site's top bar: the mark and name, the sections, language, settings. */
export function SiteHeader({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');

  return (
    <header className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
      <Link
        href={home}
        aria-label={t['nav.home']}
        className="flex items-center gap-2.5 text-ink"
      >
        <BrandMark />
        <span className="font-display text-[28px] font-black leading-none">
          {BRAND[locale]}
        </span>
      </Link>

      <nav
        aria-label={t['nav.reciters']}
        className="order-3 flex w-full gap-6 overflow-x-auto text-[15px] font-medium sm:order-none sm:w-auto sm:gap-7 sm:text-base"
      >
        <a
          href={`${home}#reciters`}
          className="whitespace-nowrap text-ink hover:text-primary"
        >
          {t['nav.reciters']}
        </a>
        <a
          href={`${home}#tools`}
          className="whitespace-nowrap text-ink hover:text-primary"
        >
          {t['nav.tools']}
        </a>
        <Link
          href={withLocale(locale, '/about')}
          className="whitespace-nowrap text-ink hover:text-primary"
        >
          {t['nav.about']}
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href={locale === 'ar' ? '/en' : '/'}
          hrefLang={locale === 'ar' ? 'en' : 'ar'}
          className="rounded-full px-3 py-2 text-[15px] text-ink-muted hover:text-ink"
        >
          {t['nav.otherLanguage']}
        </Link>
        <Link
          href={withLocale(locale, '/settings')}
          aria-label={t['footer.settings']}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
        >
          <IoSettingsOutline className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
