import Link from 'next/link';
import { Suspense } from 'react';
import {
  IoBookOutline,
  IoCodeSlashOutline,
  IoInformationCircleOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5';

import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { HeaderMark } from './header-mark';
import { HeaderShell } from './header-shell';
import { LanguageSwitch } from './language-switch';
import { LogoMark } from './logo-mark';
import { MARK_SLOT_ID } from './logo-mark-3d';
import { type MenuLink, SiteMenu } from './site-menu';
import { SiteNav } from './site-nav';
import { ThemeToggle } from './theme-toggle';
import { Wordmark } from './wordmark';

const COPY = { ar, en, de } as const;


/** The site's top bar: the wordmark, then the sections and the light/dark
 * pill, or on a phone a menu button that holds them. */
export function SiteHeader({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');
  const icon = 'h-[18px] w-[18px]';
  // Pages of their own, not jumps to the home's sections.
  const links: MenuLink[] = [
    {
      href: '/surahs',
      label: t['nav.surahs'],
      icon: <IoBookOutline className={icon} aria-hidden="true" />,
    },
    {
      href: '/developers',
      label: t['nav.developers'],
      icon: <IoCodeSlashOutline className={icon} aria-hidden="true" />,
    },
    {
      href: withLocale(locale, '/about'),
      label: t['nav.about'],
      icon: <IoInformationCircleOutline className={icon} aria-hidden="true" />,
    },
  ];
  const account: MenuLink = {
    href: '/account',
    label: t['nav.account'],
    icon: <IoPersonCircleOutline className={icon} aria-hidden="true" />,
  };

  return (
    <HeaderShell>
      <header className="site-bar mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-8 sm:px-6">
        <Link
          href={home}
          aria-label={t['nav.home']}
          className="bar-in flex items-center text-ink transition-colors duration-300 sm:justify-self-start"
        >
          {/* The 3D mark lands here from the home hero; elsewhere the flat one
              shows. The slot's width holds the 10px gap to the wordmark. */}
          <span
            id={MARK_SLOT_ID}
            className="block h-9 w-[46px] shrink-0 overflow-hidden sm:h-11 sm:w-[54px]"
          >
            <HeaderMark label={BRAND[locale]} />
            <LogoMark className="h-full w-9 text-gold sm:w-11" />
          </span>
          <Wordmark className="h-9 w-auto sm:h-11" />
          <span className="sr-only">{BRAND[locale]}</span>
        </Link>

        {/* Wider screens: the sections in the middle of the bar (a three-part
            grid, so they sit at its true centre whatever the sides weigh),
            the light/dark pill at the end. */}
        <div
          className="bar-in hidden sm:block"
          style={{ animationDelay: '80ms' }}
        >
          <SiteNav links={links} label={t['nav.reciters']} />
        </div>
        <div
          className="bar-in hidden items-center gap-2 sm:flex sm:justify-self-end"
          style={{ animationDelay: '160ms' }}
        >
          <Link
            href={account.href}
            aria-label={account.label}
            className="flex h-11 items-center gap-1.5 rounded-full border border-border px-3.5 text-[14px] font-bold text-ink transition-colors hover:border-border-strong"
          >
            <IoPersonCircleOutline className="h-[19px] w-[19px]" aria-hidden="true" />
            {account.label}
          </Link>
          <Suspense fallback={null}>
            <LanguageSwitch locale={locale} />
          </Suspense>
          <ThemeToggle />
        </div>

        {/* Phones: one row, everything else behind the menu button. */}
        <div className="bar-in sm:hidden" style={{ animationDelay: '120ms' }}>
          <SiteMenu links={[...links, account]} locale={locale} />
        </div>
      </header>
    </HeaderShell>
  );
}
