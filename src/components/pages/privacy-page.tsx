'use client';

import Link from 'next/link';
import { useIntl } from 'react-intl';

import type { SeoLocale } from '@/lib/seo/routes';
import { withLocale } from '@/lib/seo/routes';

const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * What the site keeps and why: short sections, a list where a section names several
 * things (its lines in the copy), and the contact page for anything else.
 */
export default function PrivacyPage() {
  const { formatMessage, locale } = useIntl();
  const t = (id: string) => formatMessage({ id });
  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <h1 className="font-display text-[34px] font-black leading-[1.3] text-ink sm:text-[48px]">
          {t('privacy.title')}
        </h1>
        <p className="text-[15px] text-ink-subtle">{t('privacy.effectiveDate')}</p>
      </header>
      {SECTIONS.map((n) => {
        const lines = t(`privacy.s${n}.body`).split('\n');
        return (
          <section key={n} className="flex flex-col gap-3">
            <h2 className="text-[22px] font-bold leading-[1.4] text-ink sm:text-2xl">{t(`privacy.s${n}.title`)}</h2>
            {lines.length > 1 ? (
              <ul className="flex list-disc flex-col gap-2.5 ps-5 text-[17px] leading-[1.85] text-ink-muted marker:text-gold">
                {lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[17px] leading-[1.85] text-ink-muted">{lines[0]}</p>
            )}
          </section>
        );
      })}
      <Link
        href={withLocale(locale as SeoLocale, '/contact')}
        className="w-fit rounded-full border border-border px-5 py-2.5 text-[15px] font-bold text-ink transition-colors hover:border-border-strong"
      >
        {t('privacy.contactLink')}
      </Link>
    </article>
  );
}
