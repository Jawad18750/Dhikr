import HomeClient from '@/components/home-client';
import { HomeHero } from '@/components/site/home-hero';
import { ToolsSection } from '@/components/site/tools-section';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';
import { buildPageMetadata } from '@/lib/seo/metadata';
import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

const COPY = { ar, en, de } as const;

export const homeMetadata = (locale: SeoLocale) => {
  const copy = COPY[locale];

  return buildPageMetadata({
    locale,
    path: '/',
    title: copy['site.title'],
    description: copy.appDescription,
  });
};

/** The home: the hero, the reciters with search and filters, the open tools. */
export async function HomeRoute({ locale }: { locale: SeoLocale }) {
  const reciters = await getDhikrCatalogue();

  return (
    <div className="flex w-full flex-col gap-12 px-4 pb-16 sm:gap-[72px] sm:px-6">
      <HomeHero locale={locale} />
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-12 sm:gap-[72px]">
        <HomeClient reciters={reciters} />
        <ToolsSection
          locale={locale}
          sampleSlug={reciters[0]?.slug}
          reciterCount={reciters.length}
        />
      </div>
    </div>
  );
}
