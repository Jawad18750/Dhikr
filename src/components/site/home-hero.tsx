import { IoGridOutline, IoPlay } from 'react-icons/io5';

import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { LogoMark3D } from './logo-mark-3d';

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
      data-header-tone="dark"
      aria-labelledby="hero-title"
      className="relative mx-auto flex w-full max-w-[1560px] flex-col-reverse items-center overflow-hidden rounded-[28px] bg-hero text-on-hero sm:rounded-[40px] lg:min-h-[640px] lg:flex-row"
    >
      <div className="flex w-full flex-col items-center gap-7 px-6 pb-10 pt-2 text-center sm:px-12 sm:pb-14 lg:flex-1 lg:items-start lg:px-20 lg:py-20 lg:text-start">
        <span className="flex items-center gap-2 rounded-full border border-on-hero/20 px-4 py-1.5 text-sm text-on-hero/80 sm:text-[15px]">
          <span
            className="h-2 w-2 rounded-full bg-gold-light"
            aria-hidden="true"
          />
          {t['hero.badge']}
        </span>
        <h1
          id="hero-title"
          className="text-[34px] font-medium leading-[1.3] sm:text-[54px] lg:text-[64px]"
        >
          {t['hero.title1']}
          <br />
          {t['hero.title2']}
        </h1>
        <p className="max-w-[560px] text-lg leading-[1.75] text-on-hero/70 sm:text-[22px]">
          {t['hero.body']}
        </p>
        <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
          {listenHref && (
            <a
              href={listenHref}
              className="flex h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-7 text-[17px] font-bold text-[#1b1712] transition-transform hover:-translate-y-0.5"
            >
              <IoPlay className="h-4 w-4" aria-hidden="true" />
              {t['hero.listen']}
            </a>
          )}
          <a
            href="#reciters"
            className="flex h-[52px] items-center gap-2.5 rounded-full border-[1.5px] border-on-hero/40 px-7 text-[17px] font-bold text-on-hero transition-colors hover:border-on-hero/80"
          >
            <IoGridOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            {t['hero.browse']}
          </a>
        </div>
        <span className="mt-2 text-xs font-bold tracking-[0.12em] text-on-hero/50">
          {t['hero.project']}
        </span>
      </div>
      <div className="flex w-full items-center justify-center px-6 pt-10 lg:w-[46%] lg:p-8">
        <LogoMark3D
          label={t['hero.art']}
          className="aspect-square w-[260px] sm:w-[360px] lg:w-[540px]"
        />
      </div>
    </section>
  );
}
