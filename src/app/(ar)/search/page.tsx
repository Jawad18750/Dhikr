import { headers } from 'next/headers';
import Link from 'next/link';
import { IoSearchOutline } from 'react-icons/io5';

import { AyahInk } from '@/components/site/ayah-ink';
import { allow } from '@/lib/reader/guard';
import { type Group, GROUPS, type Hit, search } from '@/lib/search';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export const metadata = {
  ...buildPageMetadata({
    locale: 'ar',
    path: '/search',
    title: 'البحث | ذكر',
    description: 'ابحث في القرآن الكريم، وكتب الحديث، وموسوعة التفسير الموضوعي، والتفاسير، والمكتبة.',
    omitLanguages: true,
  }),
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string; in?: string; page?: string }> };

const number = new Intl.NumberFormat('ar-u-nu-latn');
const PER = 20;

function HitCard({ hit }: { hit: Hit }) {
  return (
    <li>
      <Link
        href={hit.href}
        className="flex flex-col gap-2 rounded-[20px] border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
      >
        <span className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
          <span className="font-bold text-ink">{hit.title}</span>
          {hit.where && <span className="text-ink-subtle">{hit.where}</span>}
        </span>
        {hit.group === 'quran' && hit.surah && hit.ayah ? (
          <span className="block text-ink">
            <AyahInk surah={hit.surah} ayah={hit.ayah} label={hit.title} line={46} />
          </span>
        ) : (
          <span className="text-[16px] leading-[2] text-ink-muted">
            {hit.before}
            <mark className="rounded bg-gold/25 px-0.5 text-ink">{hit.match}</mark>
            {hit.after}
          </span>
        )}
      </Link>
    </li>
  );
}

/** Search across the texts: a field, the kinds with their counts, and the results. */
export default async function Page({ searchParams }: Props) {
  const { q = '', in: within, page: p } = await searchParams;
  const query = q.trim().slice(0, 120);
  const group = GROUPS.some((g) => g.id === within) ? (within as Group) : null;
  const page = Math.max(1, Math.min(50, Number(p) || 1));

  // A search costs a scan of every text: so many per address, as for the ink.
  const h = await headers();
  const address = h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const allowed = !query || (allow(`search:m:${address}`, 30, 60_000) && allow(`search:h:${address}`, 400, 3600_000));
  const results = query && allowed ? await search(query, group, page, PER) : null;
  const pages = results && group ? Math.ceil(Math.min(results.total, 1000) / PER) : 1;
  const url = (g: Group | null, n = 1) =>
    `/search?q=${encodeURIComponent(query)}${g ? `&in=${g}` : ''}${n > 1 ? `&page=${n}` : ''}`;

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <h1 className="font-display text-[30px] font-black text-ink sm:text-[40px]">البحث</h1>
      <form action="/search" role="search" className="flex gap-2">
        {group && <input type="hidden" name="in" value={group} />}
        <label className="relative flex-1">
          <span className="sr-only">ابحث</span>
          <IoSearchOutline className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus={!query}
            maxLength={120}
            placeholder="آية، أو حديث، أو موضوع…"
            className="h-12 w-full rounded-full border border-border bg-surface pe-4 ps-11 text-[17px] text-ink outline-none placeholder:text-ink-subtle focus:border-border-strong"
          />
        </label>
        <button type="submit" className="h-12 shrink-0 rounded-full bg-ink px-5 text-[15px] font-bold text-background hover:opacity-90">
          ابحث
        </button>
      </form>

      {!query && (
        <p className="text-[15px] leading-[1.9] text-ink-muted">
          في القرآن الكريم برواية قالون، وكتب الحديث السبعة، وموسوعة التفسير الموضوعي، والتفاسير التسعة كاملةً،
          وكتب المكتبة. لا يلزم التشكيل ولا الهمزات: «الرحمن» تجد «الرَّحْمَٰنِ».
        </p>
      )}

      {query && !allowed && <p className="text-[16px] text-ink-muted">بحثتَ كثيرًا في وقت قصير. انتظر قليلًا ثم أعد المحاولة.</p>}

      {results && (
        <>
          <nav aria-label="أنواع النتائج" className="flex flex-wrap gap-1.5">
            <Link
              href={url(null)}
              className={`rounded-full px-3.5 py-1.5 text-[14px] font-bold ${group ? 'bg-surface-sunken text-ink hover:bg-border' : 'bg-ink text-background'}`}
            >
              الكل <span className="font-normal opacity-70">{number.format(Object.values(results.counts).reduce((a, b) => a + b, 0))}</span>
            </Link>
            {GROUPS.filter((g) => results.counts[g.id] > 0).map((g) => (
              <Link
                key={g.id}
                href={url(g.id)}
                className={`rounded-full px-3.5 py-1.5 text-[14px] font-bold ${group === g.id ? 'bg-ink text-background' : 'bg-surface-sunken text-ink hover:bg-border'}`}
              >
                {g.title}{' '}
                <span className="font-normal opacity-70">
                  {results.counts[g.id] >= 1000 ? '+1000' : number.format(results.counts[g.id])}
                </span>
              </Link>
            ))}
          </nav>

          {results.hits.length === 0 && <p className="text-[16px] text-ink-muted">لا نتائج. جرّب كلمة أخرى أو أقل.</p>}

          {group ? (
            <ol className="flex flex-col gap-3">
              {results.hits.map((hit) => (
                <HitCard key={hit.href} hit={hit} />
              ))}
            </ol>
          ) : (
            GROUPS.filter((g) => results.counts[g.id] > 0).map((g) => (
              <section key={g.id} className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-[22px] font-black text-ink">{g.title}</h2>
                  {results.counts[g.id] > 4 && (
                    <Link href={url(g.id)} className="text-[14px] font-bold text-ink-muted hover:text-ink">
                      كل النتائج ({results.counts[g.id] >= 1000 ? '+1000' : number.format(results.counts[g.id])}) ←
                    </Link>
                  )}
                </div>
                <ol className="flex flex-col gap-3">
                  {results.hits
                    .filter((hit) => hit.group === g.id)
                    .map((hit) => (
                      <HitCard key={hit.href} hit={hit} />
                    ))}
                </ol>
              </section>
            ))
          )}

          {group && pages > 1 && (
            <nav aria-label="الصفحات" className="flex items-center justify-between gap-2 border-t border-border pt-5">
              {page > 1 ? (
                <Link href={url(group, page - 1)} className="flex h-11 items-center rounded-full border border-border px-4 text-[15px] font-bold text-ink">
                  السابق
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[14px] tabular-nums text-ink-subtle">
                {page} من {pages}
              </span>
              {page < pages ? (
                <Link href={url(group, page + 1)} className="flex h-11 items-center rounded-full bg-ink px-4 text-[15px] font-bold text-background">
                  التالي
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
