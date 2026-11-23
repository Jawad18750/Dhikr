import Link from 'next/link';
import {
  IoCodeSlashOutline,
  IoInformationCircleOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { HeaderShell } from './header-shell';
import { LogoMark } from './logo-mark';
import { MARK_SLOT_ID } from './logo-mark-3d';
import { ThemeToggle } from './theme-toggle';
import { Wordmark } from './wordmark';

const COPY = { ar, en, de } as const;

const navLink =
  'flex items-center gap-1.5 whitespace-nowrap text-ink transition-colors hover:text-primary';

/** The site's top bar: the wordmark, the sections, and the light/dark pill. */
export function SiteHeader({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');

  return (
    <HeaderShell>
      <header className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:gap-x-8 sm:px-6 sm:py-4">
        <Link
          href={home}
          aria-label={t['nav.home']}
          className="flex items-center gap-2.5 text-ink"
        >
          {/* The 3D mark lands here from the home hero; elsewhere the flat one shows. */}
          <span
            id={MARK_SLOT_ID}
            className="block h-9 w-9 shrink-0 sm:h-11 sm:w-11"
          >
            <LogoMark className="h-full w-full text-gold" />
          </span>
          <Wordmark className="h-9 w-auto sm:h-11" />
          <span className="sr-only">{BRAND[locale]}</span>
        </Link>

        <nav
          aria-label={t['nav.reciters']}
          className="order-3 flex w-full gap-6 overflow-x-auto text-[15px] font-medium sm:order-none sm:ms-auto sm:w-auto sm:gap-7 sm:text-base"
        >
          <a href={`${home}#reciters`} className={navLink}>
            <IoPeopleOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            {t['nav.reciters']}
          </a>
          <a href={`${home}#tools`} className={navLink}>
            <IoCodeSlashOutline
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
            {t['nav.tools']}
          </a>
          <Link href={withLocale(locale, '/about')} className={navLink}>
            <IoInformationCircleOutline
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
            {t['nav.about']}
          </Link>
        </nav>

        <ThemeToggle />
      </header>
    </HeaderShell>
  );
}
