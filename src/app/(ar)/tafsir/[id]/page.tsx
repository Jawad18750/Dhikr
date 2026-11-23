import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardMark } from '@/components/site/logo-mark';
import { SURAHS } from '@/constants';
import { qalunSurah } from '@/lib/qalun-text';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { tafsirs } from '@/lib/tafsir';
import { ayahCountAr, removeTashkeel } from '@/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = tafsirs().find((x) => x.id === id);
  if (!t) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/tafsir/${id}`,
    title: `${t.title} | ذكر`,
    description: `${t.title}، ${t.author}: التفسير كاملًا على آيات مصحف الجماهيرية برواية قالون.`,
    omitLanguages: true,
  });
}

/** One tafsir: its 114 surahs. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const t = tafsirs().find((x) => x.id === id);
  if (!t) notFound();
  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <Link href="/tafsir" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          التفاسير
        </Link>
        <h1 className="font-display text-[30px] font-black leading-[1.3] sm:text-[44px]">{t.title}</h1>
        <p className="text-[17px] text-on-hero/75">{t.author}</p>
      </section>
      <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {SURAHS.map((surah) => (
          <li key={surah.id}>
            <Link
              href={`/tafsir/${t.id}/${surah.id}`}
              className="group flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-3 transition-colors hover:border-border-strong"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-[14px] font-bold tabular-nums text-ink-muted">
                {surah.id}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[17px] font-bold text-ink">سورة {removeTashkeel(surah.name).replace(/^سورة\s+/, '')}</span>
                <span className="text-[13px] text-ink-subtle">{ayahCountAr(qalunSurah(surah.id).length)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
