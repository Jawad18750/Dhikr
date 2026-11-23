import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward, IoListOutline } from 'react-icons/io5';

import { HadithCard } from '@/components/site/hadith-card';
import { collection, hadithsOfChapter } from '@/lib/hadith';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string; n: string }> };

function load(slug: string, n: string) {
  const c = collection(slug);
  const chapter = c?.chapters[Number(n) - 1];
  return c && chapter ? { c, chapter } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  const at = load(slug, n);
  if (!at) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/hadith/${slug}/chapter/${n}`,
    title: `${at.chapter.title} · ${at.c.title} | ذكر`,
    description: `${at.chapter.title}، من ${at.c.title}: ${at.chapter.count} حديثًا.`,
    omitLanguages: true,
  });
}

/** One chapter of a collection, every hadith in it. */
export default async function Page({ params }: Props) {
  const { slug, n } = await params;
  const at = load(slug, n);
  if (!at) notFound();
  const { c, chapter } = at;
  const link = 'flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong';
  const nav = (
    <nav aria-label="الأبواب" className="flex items-center justify-between gap-2">
      {chapter.n > 1 ? (
        <Link href={`/hadith/${slug}/chapter/${chapter.n - 1}`} className={link}>
          <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          السابق
        </Link>
      ) : (
        <span />
      )}
      <Link
        href={`/hadith/${slug}`}
        aria-label="الأبواب"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
      >
        <IoListOutline className="h-5 w-5" aria-hidden="true" />
      </Link>
      {chapter.n < c.chapters.length ? (
        <Link
          href={`/hadith/${slug}/chapter/${chapter.n + 1}`}
          className="flex h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-[15px] font-bold text-background hover:opacity-90"
        >
          التالي
          <IoChevronBack className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );

  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-5 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <Link href={`/hadith/${slug}`} className="text-[15px] font-bold text-ink-muted hover:text-ink">
          {c.title}
        </Link>
        <h1 className="font-display text-[28px] font-black leading-[1.4] text-ink sm:text-[34px]">{chapter.title}</h1>
        <span className="text-[13px] tabular-nums text-ink-subtle">
          {chapter.n} من {c.chapters.length}
        </span>
      </header>
      {hadithsOfChapter(c, chapter).map((h) => (
        <HadithCard key={h.number} slug={slug} hadith={h} />
      ))}
      <div className="border-t border-border pt-5">{nav}</div>
    </article>
  );
}
