import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { AyahInk } from '@/components/site/ayah-ink';
import { SURAHS } from '@/constants';
import { qalunSurah } from '@/lib/qalun-text';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { tafsirFor, tafsirs } from '@/lib/tafsir';
import { removeTashkeel } from '@/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string; surah: string; ayah: string }> };

const surahName = (n: number) => removeTashkeel(SURAHS.find((s) => s.id === n)?.name ?? '').replace(/^سورة\s+/, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, surah, ayah } = await params;
  const t = tafsirs().find((x) => x.id === id);
  const a = qalunSurah(Number(surah)).find((x) => x.ayah === Number(ayah));
  if (!t || !a) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/tafsir/${id}/${surah}/${ayah}`,
    title: `تفسير ${surahName(Number(surah))} ${ayah} · ${t.title} | ذكر`,
    description: a.text,
    omitLanguages: true,
  });
}

/** One ayah in one tafsir: its whole commentary, and the same ayah in the other tafsirs. */
export default async function Page({ params }: Props) {
  const { id, surah, ayah } = await params;
  const t = tafsirs().find((x) => x.id === id);
  const n = Number(surah);
  const ayahs = qalunSurah(n);
  const a = ayahs.find((x) => x.ayah === Number(ayah));
  if (!t || !a) notFound();
  const passages = tafsirFor(t.id, n, a.ayah) ?? [];
  const link = 'flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong';

  return (
    <article className="mx-auto flex w-full max-w-[780px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-3 border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-ink-muted">
          <Link href={`/tafsir/${t.id}`} className="hover:text-ink">
            {t.title}
          </Link>
          <span aria-hidden="true">·</span>
          <Link href={`/tafsir/${t.id}/${n}`} className="hover:text-ink">
            سورة {surahName(n)}
          </Link>
        </div>
        <div className="rounded-[22px] bg-surface-sunken px-5 py-4 text-ink">
          <AyahInk surah={n} ayah={a.ayah} text={a.text} line={84} />
        </div>
      </header>

      {passages.length === 0 ? (
        <p className="text-[16px] text-ink-muted">لا تفسير لهذه الآية في هذا الكتاب.</p>
      ) : (
        passages.map((p) => (
          <section key={p.hafs.join('-')} className="flex flex-col gap-4">
            {(p.hafs[0] !== p.hafs[1] || p.hafs[0] !== a.ayah) && (
              <span className="self-start rounded-full border border-border px-3 py-1 text-[13px] text-ink-subtle">
                {p.hafs[0] === p.hafs[1]
                  ? `الآية ${p.hafs[0]} في ترقيم حفص`
                  : `الآيات ${p.hafs[0]}–${p.hafs[1]} في ترقيم حفص`}
              </span>
            )}
            {p.text.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line text-[18px] leading-[2.1] text-ink">
                {paragraph}
              </p>
            ))}
          </section>
        ))
      )}

      <nav aria-label="الآيات" className="flex items-center justify-between gap-2 border-t border-border pt-5">
        {a.ayah > 1 ? (
          <Link href={`/tafsir/${t.id}/${n}/${a.ayah - 1}`} className={link}>
            <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
            الآية {a.ayah - 1}
          </Link>
        ) : (
          <span />
        )}
        {a.ayah < ayahs.length ? (
          <Link href={`/tafsir/${t.id}/${n}/${a.ayah + 1}`} className={link}>
            الآية {a.ayah + 1}
            <IoChevronBack className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-bold text-ink">هذه الآية في التفاسير الأخرى</h2>
        <div className="flex flex-wrap gap-2">
          {tafsirs()
            .filter((x) => x.id !== t.id)
            .map((x) => (
              <Link
                key={x.id}
                href={`/tafsir/${x.id}/${n}/${a.ayah}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-[14px] text-ink-muted hover:border-border-strong hover:text-ink"
              >
                {x.title}
              </Link>
            ))}
        </div>
      </section>
    </article>
  );
}
