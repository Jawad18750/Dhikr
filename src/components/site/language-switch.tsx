'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { IoCheckmark, IoGlobeOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import {
  LOCALE_NAMES,
  LOCALES,
  type SeoLocale,
  stripLocale,
  withLocale,
} from '@/lib/seo/routes';

/** A flag beside each language: where most of its readers here are. */
const LOCALE_FLAGS: Record<SeoLocale, string> = {
  ar: '🇱🇾',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  tr: '🇹🇷',
  id: '🇮🇩',
  ms: '🇲🇾',
  ur: '🇵🇰',
  fa: '🇮🇷',
  bn: '🇧🇩',
  ru: '🇷🇺',
};

/**
 * The globe: a short list of every language by its own name. A choice goes to the
 * same page in that language (a full load: each language is its own document, its
 * own direction). `up` opens the list above the button, for the phone menu.
 */
export function LanguageSwitch({
  locale,
  up = false,
}: {
  locale: SeoLocale;
  up?: boolean;
}) {
  const { formatMessage } = useIntl();
  const pathname = usePathname() ?? '/';
  const search = useSearchParams()?.toString();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();
  const bare = stripLocale(pathname);
  // Reciter and surah pages are Arabic documents (their twins lead back here), so
  // another language opens on its home.
  const arabicOnly = /^\/(?:reciter\/|surah\/|(?:surahs|developers|account|admin)$)/.test(bare);
  const hrefFor = (target: SeoLocale) =>
    arabicOnly && target !== 'ar'
      ? withLocale(target, '/')
      : `${withLocale(target, bare)}${search ? `?${search}` : ''}`;

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={formatMessage({ id: 'nav.language' })}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-[border-color,transform] duration-300 hover:border-border-strong active:scale-90"
      >
        <IoGlobeOutline className="h-[19px] w-[19px]" aria-hidden="true" />
      </button>
      {open && (
        <ul
          id={listId}
          className={`absolute end-0 z-50 grid max-h-[min(70vh,520px)] w-[min(88vw,400px)] grid-cols-2 gap-1 overflow-auto rounded-[20px] border border-border bg-surface p-1.5 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.35)] ${
            up ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          } menu-pop`}
        >
          {LOCALES.map((target) => (
            <li key={target}>
              <a
                href={hrefFor(target)}
                hrefLang={target}
                lang={target}
                aria-current={target === locale ? 'true' : undefined}
                className={`flex h-12 items-center gap-3 rounded-[14px] px-3 text-[15px] transition-colors ${
                  target === locale
                    ? 'bg-surface-sunken font-bold text-ink'
                    : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[17px] leading-none"
                >
                  {LOCALE_FLAGS[target]}
                </span>
                {/* bdi: each name keeps its own direction without moving off the row's start. */}
                <span className="min-w-0 flex-1 truncate text-start">
                  <bdi>{LOCALE_NAMES[target]}</bdi>
                </span>
                {target === locale && <IoCheckmark className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
