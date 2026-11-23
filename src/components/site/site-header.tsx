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
import { type MenuLink, SiteMenu } from './site-menu';
import { ThemeToggle } from './theme-toggle';
import { Wordmark } from './wordmark';

const COPY = { ar, en, de } as const;

const navLink =
  'flex items-center gap-1.5 whitespace-nowrap text-ink transition-colors hover:text-primary';

/** The site's top bar: the wordmark, then the sections and the light/dark
 * pill, or on a phone a menu button that holds them. */
export function SiteHeader({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');
  const icon = 'h-[18px] w-[18px]';
  const links: MenuLink[] = [
    {
      href: `${home}#reciters`,
      label: t['nav.reciters'],
      icon: <IoPeopleOutline className={icon} aria-hidden="true" />,
    },
    {
      href: `${home}#tools`,
      label: t['nav.tools'],
      icon: <IoCodeSlashOutline className={icon} aria-hidden="true" />,
    },
    {
      href: withLocale(locale, '/about'),
      label: t['nav.about'],
      icon: <IoInformationCircleOutline className={icon} aria-hidden="true" />,
    },
  ];

  return (
    <HeaderShell>
      <header className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-4 py-2.5 sm:gap-8 sm:px-6 sm:py-4">
        <Link
          href={home}
          aria-label={t['nav.home']}
          className="flex items-center text-ink"
        >
          {/* The 3D mark lands here from the home hero; elsewhere the flat one
              shows. The slot's width holds the 10px gap to the wordmark. */}
          <span
            id={MARK_SLOT_ID}
            className="block h-9 w-[46px] shrink-0 overflow-hidden sm:h-11 sm:w-[54px]"
          >
            <LogoMark className="h-full w-9 text-gold sm:w-11" />
          </span>
          <Wordmark className="h-9 w-auto sm:h-11" />
          <span className="sr-only">{BRAND[locale]}</span>
        </Link>

        {/* Wider screens: the sections and the light/dark pill in the bar. */}
        <nav
          aria-label={t['nav.reciters']}
          className="ms-auto hidden gap-7 text-base font-medium sm:flex"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} className={navLink}>
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Phones: one row, everything else behind the menu button. */}
        <div className="sm:hidden">
          <SiteMenu links={links} />
        </div>
      </header>
    </HeaderShell>
  );
}
