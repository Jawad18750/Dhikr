import HomeClient from '@/components/home-client';
import { HomeHero } from '@/components/site/home-hero';
import { ToolsSection } from '@/components/site/tools-section';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';
import { reciterName } from '@/lib/reciter-names';
import { buildPageMetadata } from '@/lib/seo/metadata';
import type { SeoLocale } from '@/lib/seo/routes';
import { MESSAGES } from '@/locales';

const COPY = MESSAGES;

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
  // Names in the page's own script; the Arabic stays searchable beside it.
  const reciters = (await getDhikrCatalogue()).map((reciter) => ({
    ...reciter,
    name: reciterName(reciter.slug, reciter.name, locale),
    altName: reciter.name,
  }));

  return (
    <div className="flex w-full flex-col gap-12 px-4 pb-16 sm:gap-[72px] sm:px-6">
      <HomeHero locale={locale} />
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-12 sm:gap-[72px]">
        <HomeClient reciters={reciters} />
        <ToolsSection
          locale={locale}
          reciterCount={reciters.length}
        />
      </div>
    </div>
  );
}
