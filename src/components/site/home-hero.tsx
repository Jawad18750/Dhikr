import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { Rosette } from './rosette';

const COPY = { ar, en, de } as const;

/** The black hero card: what the site is, and the way in. */
export function HomeHero({
  locale,
  listenHref,
}: {
  locale: SeoLocale;
  /** The first recitation to play (the most listened one). */
  listenHref?: string;
}) {
  const t = COPY[locale];

  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col-reverse items-center overflow-hidden rounded-[28px] bg-hero text-on-hero dark:ring-1 dark:ring-border sm:rounded-[36px] lg:min-h-[520px] lg:flex-row"
    >
      <div className="flex w-full flex-col gap-6 px-6 pb-8 pt-2 sm:px-10 sm:pb-12 lg:flex-1 lg:px-16 lg:py-14">
        <span className="border-gold-light/35 self-start rounded-full border px-4 py-1.5 text-sm font-medium text-gold-light sm:text-[15px]">
          {t['hero.badge']}
        </span>
        <h1
          id="hero-title"
          className="font-display text-[32px] font-black leading-[1.3] sm:text-[52px] lg:text-[60px]"
        >
          {t['hero.title1']}
          <br />
          {t['hero.title2']}
        </h1>
        <p className="max-w-[540px] text-[17px] leading-[1.75] text-[#cfcac0] sm:text-xl">
          {t['hero.body']}
        </p>
        <div className="flex flex-wrap gap-3">
          {listenHref && (
            <a
              href={listenHref}
              className="flex h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-7 text-[17px] font-bold text-[#1b1712] transition-opacity hover:opacity-90"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M12 2.5 L12 13.5 L3 8 Z" fill="currentColor" />
              </svg>
              {t['hero.listen']}
            </a>
          )}
          <a
            href="#reciters"
            className="flex h-[52px] items-center rounded-full border-[1.5px] border-white/40 px-7 text-[17px] font-bold text-on-hero transition-colors hover:border-white/70"
          >
            {t['hero.browse']}
          </a>
        </div>
        <span className="text-[13px] tracking-[0.06em] text-[#8f8a80]">
          {t['hero.project']}
        </span>
      </div>
      <div className="flex w-full items-center justify-center px-6 pt-8 lg:w-[44%] lg:p-6">
        <Rosette
          label={t['hero.art']}
          className="h-[180px] w-[180px] sm:h-[260px] sm:w-[260px] lg:h-[420px] lg:w-[420px]"
        />
      </div>
    </section>
  );
}
