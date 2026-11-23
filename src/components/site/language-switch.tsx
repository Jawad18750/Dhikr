'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';

import { type SeoLocale, stripLocale, withLocale } from '@/lib/seo/routes';

/**
 * The other language, one round button in the bar: «EN» on the Arabic site, «ع» on the
 * others. It goes to the same page in that language (a full load: each language is its
 * own document, its own direction).
 */
export function LanguageSwitch({ locale }: { locale: SeoLocale }) {
  const { formatMessage } = useIntl();
  const pathname = usePathname() ?? '/';
  const search = useSearchParams()?.toString();
  const other: SeoLocale = locale === 'ar' ? 'en' : 'ar';
  const href = `${withLocale(other, stripLocale(pathname))}${search ? `?${search}` : ''}`;
  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={formatMessage({ id: 'nav.otherLanguage' })}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-[14px] font-bold text-ink transition-[border-color,transform] duration-300 hover:border-border-strong active:scale-90"
    >
      {other === 'en' ? 'EN' : 'ع'}
    </a>
  );
}
