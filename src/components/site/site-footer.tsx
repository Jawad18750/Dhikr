import Link from 'next/link';
import { IoCodeSlashOutline, IoKeyOutline, IoMailOutline } from 'react-icons/io5';

import { isRtl, type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import { MESSAGES } from '@/locales';

import { InstallApp } from './install-app';
import { LogoMark3D } from './logo-mark-3d';
import { LatinWordmark, Wordmark } from './wordmark';

const COPY = MESSAGES;

const link = 'w-fit text-ink-muted transition-colors hover:text-ink';
const heading = 'text-sm font-bold text-ink';

/**
 * The page foot: the name with what the site is in one line, two short
 * columns of links, and a last line with the year. Above them, the way in for those
 * who build on the data (a key, the documentation).
 */
export function SiteFooter({ locale }: { locale: SeoLocale }) {
  const t = COPY[locale];
  const home = withLocale(locale, '/');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-10 px-4 pb-8 pt-12 text-[15px] sm:px-6 sm:pt-16">
        {/* Everywhere, the way in for those who build: a key, and the documentation. */}
        <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[22px] font-black text-ink">{t['cta.title']}</span>
            <span className="max-w-[560px] text-[15px] leading-[1.8] text-ink-muted">{t['cta.body']}</span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/account?next=/developers"
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
            >
              <IoKeyOutline className="h-[17px] w-[17px]" aria-hidden="true" />
              {t['cta.key']}
            </Link>
            <Link
              href="/developers"
              className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-bold text-ink hover:border-border-strong"
            >
              <IoCodeSlashOutline className="h-[17px] w-[17px]" aria-hidden="true" />
              {t['cta.docs']}
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-[380px] flex-col gap-4">
            <Link
              href={home}
              aria-label={BRAND[locale]}
              className="flex w-fit items-center gap-2.5 text-ink"
            >
              <LogoMark3D badge label={BRAND[locale]} className="h-10 w-10" />
              {isRtl(locale) ? (
                <Wordmark className="h-10 w-auto" title={BRAND[locale]} />
              ) : (
                <LatinWordmark className="text-[28px]" />
              )}
            </Link>
            <p className="leading-[1.8] text-ink-muted">{t['hero.body']}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:flex sm:gap-16">
            <nav aria-label={t['footer.explore']} className="flex flex-col gap-3">
              <span className={heading}>{t['footer.explore']}</span>
              <Link href="/surahs" className={link}>
                {t['nav.surahs']}
              </Link>
              <Link href="/library" className={link}>
                {t['nav.library']}
              </Link>
              <Link href="/prayer-times" className={link}>
                {t['tools.prayerLibya']}
              </Link>
              <Link href="/developers" className={link}>
                {t['nav.developers']}
              </Link>
              <Link href="/account" className={link}>
                {t['nav.account']}
              </Link>
            </nav>
            <nav aria-label={t['footer.apps']} className="flex flex-col gap-3">
              <span className={heading}>{t['footer.apps']}</span>
              <InstallApp locale={locale} look="link" className={link} />
              <a href="https://adhan.dhikr.ly" className={link}>
                {t['apps.adhan']}
              </a>
              <a href="https://mushaf.dhikr.ly" className={link}>
                {t['apps.mushaf']}
              </a>
              <a href="https://masahif.dhikr.ly" className={link}>
                {t['apps.masahif']}
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
            href={withLocale(locale, '/contact')}
            className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold text-ink hover:border-border-strong"
          >
            <IoMailOutline className="h-[17px] w-[17px]" aria-hidden="true" />
            {t['footer.write']}
          </Link>
        </div>
      </div>
    </footer>
  );
}
