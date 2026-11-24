import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AyahInk } from '@/components/site/ayah-ink';
import { SURAHS } from '@/constants';
import { qalunSurah } from '@/lib/qalun-text';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { tafsirFor, tafsirs } from '@/lib/tafsir';
import { removeTashkeel } from '@/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string; surah: string }> };

const surahTitle = (n: number) =>
  `سورة ${removeTashkeel(SURAHS.find((s) => s.id === n)?.name ?? '').replace(/^سورة\s+/, '')}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, surah } = await params;
  const t = tafsirs().find((x) => x.id === id);
  const n = Number(surah);
  if (!t || !Number.isInteger(n) || n < 1 || n > 114) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/tafsir/${id}/${n}`,
    title: `${surahTitle(n)} · ${t.title} | ذكر`,
    description: `تفسير ${surahTitle(n)} من ${t.title}، آيةً آيةً على مصحف الجماهيرية برواية قالون.`,
    omitLanguages: true,
  });
}

const excerpt = (text: string) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > 260 ? `${flat.slice(0, 260).replace(/\s\S*$/, '')}…` : flat;
};

/** A surah in one tafsir: each ayah with the start of its commentary. */
export default async function Page({ params }: Props) {
  const { id, surah } = await params;
  const t = tafsirs().find((x) => x.id === id);
  const n = Number(surah);
  const ayahs = Number.isInteger(n) ? qalunSurah(n) : [];
  if (!t || ayahs.length === 0) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <Link href={`/tafsir/${t.id}`} className="text-[15px] font-bold text-ink-muted hover:text-ink">
          {t.title}
        </Link>
        <h1 className="font-display text-[30px] font-black leading-[1.35] text-ink sm:text-[40px]">{surahTitle(n)}</h1>
        <nav aria-label="السور" className="flex gap-2 text-[14px]">
          {n > 1 && (
            <Link href={`/tafsir/${t.id}/${n - 1}`} className="rounded-full border border-border px-3 py-1 text-ink-muted hover:text-ink">
              {surahTitle(n - 1)}
            </Link>
          )}
          {n < 114 && (
            <Link href={`/tafsir/${t.id}/${n + 1}`} className="rounded-full border border-border px-3 py-1 text-ink-muted hover:text-ink">
              {surahTitle(n + 1)}
            </Link>
          )}
        </nav>
      </header>
      <ol className="flex flex-col gap-3">
        {ayahs.map((a) => {
          const passages = tafsirFor(t.id, n, a.ayah) ?? [];
          return (
            <li key={a.ayah}>
              <Link
                href={`/tafsir/${t.id}/${n}/${a.ayah}`}
                className="flex flex-col gap-2.5 rounded-[22px] border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
              >
                <div className="text-ink">
                  <AyahInk surah={n} ayah={a.ayah} text={a.text} line={64} />
                </div>
                {passages.length > 0 && (
                  <p className="text-[15px] leading-[1.9] text-ink-muted">{excerpt(passages.map((p) => p.text).join(' '))}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
