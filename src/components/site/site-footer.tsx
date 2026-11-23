import Link from 'next/link';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND, SITE } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

const COPY = { ar, en, de } as const;

/** The page foot: the name, the credit open-tarteel's MIT licence asks for, links. */
export function SiteFooter({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];

  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-[15px] text-ink-muted sm:px-6">
        <span>
          <b className="font-black text-ink">{BRAND[locale]}</b> · dhikr.ly
        </span>
        <a href={SITE.github} className="hover:text-ink">
          {t['site.credit']}
        </a>
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
        </span>
      </div>
    </footer>
  );
}
