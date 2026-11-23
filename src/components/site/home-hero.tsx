import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

import { LogoMark3D } from './logo-mark-3d';

const COPY = { ar, en, de } as const;

/** The hero card: what the site is; the reciters follow right below it. */
export function HomeHero({ locale }: { locale: SeoLocale }) {
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
          {t['hero.title']}
        </h1>
        <p className="max-w-[560px] text-lg leading-[1.75] text-on-hero/70 sm:text-[22px]">
          {t['hero.body']}
        </p>
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
