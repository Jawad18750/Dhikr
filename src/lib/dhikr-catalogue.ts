import { RECITER_COUNTRY } from '@/lib/reciter-countries';
import { reciterRouteFor } from '@/lib/reciter-route';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { LinkSource } from '@/types';

/**
 * Our reciters as the home page shows them: the catalogue of our audio server
 * with its portraits and its listening ranking. Read on the server and
 * revalidated hourly, so the home page renders complete without client fetches.
 */
export type CatalogueReciter = {
  /** The player route for this recitation. */
  href: string;
  /** Moshaf slug on our server; also the timings folder name. */
  slug: string;
  name: string;
  /** The other spelling of his name, for search (the Arabic, where `name` is not). */
  altName?: string;
  /** «قالون عن نافع» */
  riwaya: string;
  /** «مرتل», «حدر» … (empty when the moshaf name carries none). */
  style: string;
  /** ISO 3166 code of the reciter's country, where it has been checked. */
  country: string | null;
  surahTotal: number;
  /** The catalogue's photo, the same one the apps show. */
  portrait: string | null;
  /** 1-based place in the «popular» ranking, or null. */
  rank: number | null;
  isNew: boolean;
};

type ApiMoshaf = {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  slug?: string;
};

type ApiResponse = {
  reciters: { id: number; name: string; moshaf: ApiMoshaf[] }[];
  ranking?: { popular?: string[]; new?: string[]; hidden?: string[] };
  portraits?: Record<string, string | null>;
};

const slugOf = (moshaf: ApiMoshaf) =>
  moshaf.slug ?? moshaf.server.replace(/\/+$/, '').split('/').pop() ?? '';

/** «قالون عن نافع - مرتل» → riwaya «قالون عن نافع», style «مرتل». */
export const splitMoshafName = (name: string) => {
  const [riwaya, style = ''] = name.split(/\s+-\s+/);
  return { riwaya: riwaya.trim(), style: style.trim() };
};

export const toCatalogue = (data: ApiResponse): CatalogueReciter[] => {
  const popular = data.ranking?.popular ?? [];
  const fresh = new Set(data.ranking?.new ?? []);
  const hidden = new Set(data.ranking?.hidden ?? []);
  const out: CatalogueReciter[] = [];

  for (const reciter of data.reciters) {
    for (const moshaf of reciter.moshaf) {
      const slug = slugOf(moshaf);
      if (!slug || hidden.has(slug)) continue;
      const rankIndex = popular.indexOf(slug);
      out.push({
        href: reciterRouteFor({
          id: `${LinkSource.DHIKR}-${reciter.id}`,
          moshaf: { id: slug },
        }),
        slug,
        name: reciter.name,
        ...splitMoshafName(moshaf.name),
        country: RECITER_COUNTRY[slug] ?? null,
        surahTotal: moshaf.surah_total,
        portrait: data.portraits?.[slug] ?? null,
        rank: rankIndex === -1 ? null : rankIndex + 1,
        isNew: fresh.has(slug),
      });
    }
  }

  // Ranked first, in ranking order; the rest by name.
  return out.sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return a.name.localeCompare(b.name, 'ar');
  });
};

export async function getDhikrCatalogue(): Promise<CatalogueReciter[]> {
  try {
    const response = await fetch(`${DHIKR_AUDIO_BASE}/api/v3/reciters`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    return toCatalogue((await response.json()) as ApiResponse);
  } catch {
    return [];
  }
}

/** The portrait of one of our recitations, by its moshaf slug. */
export async function getDhikrPortrait(slug: string): Promise<string | null> {
  const catalogue = await getDhikrCatalogue();
  return catalogue.find((item) => item.slug === slug)?.portrait ?? null;
}
