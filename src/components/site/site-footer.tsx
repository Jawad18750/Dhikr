import Link from 'next/link';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { LogoMark } from './logo-mark';
import { Wordmark } from './wordmark';

const COPY = { ar, en, de } as const;

/** The page foot: the name and the links. */
export function SiteFooter({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];

  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-[15px] text-ink-muted sm:px-6">
        <span className="flex items-center gap-3">
          <LogoMark className="h-9 w-9 text-gold" />
          <Wordmark className="h-9 w-auto text-ink" title={BRAND[locale]} />
          <span dir="ltr">dhikr.ly</span>
        </span>
        <span className="flex flex-wrap gap-5">
          <Link href={withLocale(locale, '/about')} className="hover:text-ink">
            {t['nav.about']}
          </Link>
          <Link
            href={withLocale(locale, '/privacy')}
            className="hover:text-ink"
          >
            {t['footer.privacy']}
          </Link>
          <Link
            href={withLocale(locale, '/contact')}
            className="hover:text-ink"
          >
            {t['footer.contact']}
          </Link>
          <Link
            href={locale === 'ar' ? '/en' : '/'}
            hrefLang={locale === 'ar' ? 'en' : 'ar'}
            className="hover:text-ink"
          >
            {t['nav.otherLanguage']}
          </Link>
        </span>
      </div>
    </footer>
  );
}
