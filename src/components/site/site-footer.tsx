import Link from 'next/link';
import { IoGlobeOutline } from 'react-icons/io5';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { LogoMark3D } from './logo-mark-3d';
import { Wordmark } from './wordmark';

const COPY = { ar, en, de } as const;

const link = 'w-fit text-ink-muted transition-colors hover:text-ink';
const heading = 'text-sm font-bold text-ink';

/**
 * The page foot: the name with what the site is in one line, two short
 * columns of links, and a last line with the year and the other language.
 */
export function SiteFooter({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-10 px-4 pb-8 pt-12 text-[15px] sm:px-6 sm:pt-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-[380px] flex-col gap-4">
            <Link
              href={home}
              aria-label={BRAND[locale]}
              className="flex w-fit items-center gap-2.5 text-ink"
            >
              <LogoMark3D badge label={BRAND[locale]} className="h-10 w-10" />
              <Wordmark className="h-10 w-auto" title={BRAND[locale]} />
            </Link>
            <p className="leading-[1.8] text-ink-muted">{t['hero.body']}</p>
          </div>

          <div className="flex gap-16 sm:gap-20">
            <nav aria-label={t['footer.explore']} className="flex flex-col gap-3">
              <span className={heading}>{t['footer.explore']}</span>
              <a href={`${home}#reciters`} className={link}>
                {t['nav.reciters']}
              </a>
              <a href={`${home}#tools`} className={link}>
                {t['nav.tools']}
              </a>
            </nav>
            <nav aria-label={t['footer.more']} className="flex flex-col gap-3">
              <span className={heading}>{t['footer.more']}</span>
              <Link href={withLocale(locale, '/about')} className={link}>
                {t['nav.about']}
              </Link>
              <Link href={withLocale(locale, '/privacy')} className={link}>
                {t['footer.privacy']}
              </Link>
              <Link href={withLocale(locale, '/contact')} className={link}>
                {t['footer.contact']}
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-ink-subtle">
          <span>{t['footer.rights'].replace('{year}', String(year))}</span>
          <Link
            href={locale === 'ar' ? '/en' : '/'}
            hrefLang={locale === 'ar' ? 'en' : 'ar'}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
          >
            <IoGlobeOutline className="h-4 w-4" aria-hidden="true" />
            {t['nav.otherLanguage']}
          </Link>
        </div>
      </div>
    </footer>
  );
}
