import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { type SurahReciter, SurahReciters } from '@/components/site/surah-reciters';
import { SURAHS } from '@/constants';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';
import { getRecitationFiles, getSurahFacts } from '@/lib/dhikr-surah-facts';
import { breadcrumbTrail } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { withLocale } from '@/lib/seo/routes';
import { SITE } from '@/lib/seo/site';
import ar from '@/locales/ar.json';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { removeTashkeel } from '@/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

const surahOf = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? SURAHS.find((s) => s.id === n) ?? null : null;
};

/** Every reciter of ours who recites [surah], most listened first. */
async function recitersOf(surah: number): Promise<{ reciters: SurahReciter[]; ayahs: number }> {
  const catalogue = await getDhikrCatalogue();
  let ayahs = 0;
  const rows = await Promise.all(
    catalogue.map(async (item): Promise<SurahReciter | null> => {
      const [files, facts] = await Promise.all([getRecitationFiles(item.slug), getSurahFacts(item.slug)]);
      if (!files?.sizes.has(surah)) return null;
      if (!ayahs && facts[surah]?.ayahs) ayahs = facts[surah].ayahs;
      return {
        slug: item.slug,
        name: item.name,
        href: item.href,
        portrait: item.portrait,
        country: item.country,
        style: item.style,
        seconds: facts[surah]?.seconds ?? 0,
        surahs: [...files.sizes.keys()].sort((a, b) => a - b),
        server: `${DHIKR_AUDIO_BASE}/audio/${item.slug}/`,
      };
    })
  );
  return { reciters: rows.filter((row): row is SurahReciter => row !== null), ayahs };
}

export async function generateMetadata({ params }: Props) {
  const surah = surahOf((await params).id);
  if (!surah) return { title: 'Surah not found | ذكر', robots: { index: false, follow: false } };
  const name = removeTashkeel(surah.name);
  const { reciters } = await recitersOf(surah.id);
  return buildPageMetadata({
    locale: 'ar',
    path: `/surah/${surah.id}`,
    title: ar['surah.metaTitle'].replace('{name}', name),
    description: ar['surah.metaDescription']
      .replace('{name}', name)
      .replace('{count}', String(reciters.length)),
    omitLanguages: true,
  });
}

/**
 * A surah's page: its name, where it was revealed, its ayahs in this numbering, and every
 * reciter who has it, each one tap from playing it, with the mushaf line in the player.
 */
export default async function Page({ params }: Props) {
  const surah = surahOf((await params).id);
  if (!surah) notFound();
  const name = removeTashkeel(surah.name);
  const { reciters, ayahs } = await recitersOf(surah.id);
  const previous = surah.id > 1 ? SURAHS.find((s) => s.id === surah.id - 1) : null;
  const next = surah.id < 114 ? SURAHS.find((s) => s.id === surah.id + 1) : null;
  const breadcrumb = breadcrumbTrail([
    { name: 'الرئيسية', url: `${SITE.url}${withLocale('ar', '/')}` },
    { name: `سورة ${name}`, url: `${SITE.url}${withLocale('ar', `/surah/${surah.id}`)}` },
  ]);
  const chip = 'rounded-full border border-on-hero/20 px-2.5 py-0.5 text-on-hero/80 sm:px-3.5 sm:py-1';
  const step =
    'flex h-10 w-10 items-center justify-center rounded-full border border-on-hero/15 text-on-hero/80 transition-colors hover:border-on-hero/40 hover:text-on-hero';

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col items-start gap-5 px-4 pb-12 text-foreground sm:gap-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }}
      />
      <section
        data-header-tone="dark"
        aria-labelledby="surah-title"
        className="flex w-full items-center gap-4 rounded-[28px] bg-hero p-5 text-on-hero sm:gap-6 sm:rounded-[36px] sm:p-8"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-hero-gold/40 text-[20px] font-bold tabular-nums text-hero-gold sm:h-20 sm:w-20 sm:text-[28px]">
          {surah.id}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
          <h1 id="surah-title" className="font-display text-[30px] font-black leading-[1.25] sm:text-[52px]">
            {ar['surah.title'].replace('{name}', name)}
          </h1>
          <span className="flex flex-wrap gap-1.5 text-[13px] sm:gap-2 sm:text-[15px]">
            <span className={chip}>{surah.revelationType === 'Meccan' ? ar['library.meccan'] : ar['library.medinan']}</span>
            {ayahs > 0 && <span className={chip}>{ar['surah.ayahs'].replace('{count}', String(ayahs))}</span>}
            <span className="rounded-full border border-hero-gold/35 px-2.5 py-0.5 text-hero-gold sm:px-3.5 sm:py-1">
              {ar['surah.reciterCount'].replace('{count}', String(reciters.length))}
            </span>
          </span>
        </div>
        <nav aria-label={ar['surah.nav']} className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {previous ? (
            <Link href={`/surah/${previous.id}`} aria-label={`${ar['surah.previous']}: ${removeTashkeel(previous.name)}`} className={step}>
              <IoChevronForward className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          ) : (
            <span className={`${step} pointer-events-none opacity-30`} aria-hidden="true">
              <IoChevronForward className="h-[18px] w-[18px]" />
            </span>
          )}
          {next ? (
            <Link href={`/surah/${next.id}`} aria-label={`${ar['surah.next']}: ${removeTashkeel(next.name)}`} className={step}>
              <IoChevronBack className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          ) : (
            <span className={`${step} pointer-events-none opacity-30`} aria-hidden="true">
              <IoChevronBack className="h-[18px] w-[18px]" />
            </span>
          )}
        </nav>
      </section>

      <h2 className="font-display text-[24px] font-black leading-[1.3] text-ink sm:text-[32px]">
        {ar['surah.listHeading']}
      </h2>
      <SurahReciters surah={surah.id} reciters={reciters} />
    </div>
  );
}
