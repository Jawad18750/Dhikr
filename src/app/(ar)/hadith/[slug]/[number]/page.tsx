import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { HadithCard } from '@/components/site/hadith-card';
import { collection } from '@/lib/hadith';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string; number: string }> };

function load(slug: string, number: string) {
  const c = collection(slug);
  const index = c ? c.hadiths.findIndex((h) => h.number === Number(number)) : -1;
  return c && index !== -1 ? { c, index, hadith: c.hadiths[index] } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, number } = await params;
  const at = load(slug, number);
  if (!at) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/hadith/${slug}/${number}`,
    title: `${at.c.title}، الحديث ${number}: ${at.hadith.chapter} | ذكر`,
    description: at.hadith.text.slice(0, 200),
    omitLanguages: true,
  });
}

/** One hadith, on its own: to read, cite and share. */
export default async function Page({ params }: Props) {
  const { slug, number } = await params;
  const at = load(slug, number);
  if (!at) notFound();
  const { c, index, hadith } = at;
  const chapter = c.chapters.find((x) => hadith.number >= x.from && hadith.number <= x.to);
  const previous = c.hadiths[index - 1];
  const next = c.hadiths[index + 1];
  const link = 'flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong';

  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-5 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-ink-muted">
          <Link href={`/hadith/${slug}`} className="hover:text-ink">
            {c.title}
          </Link>
          {chapter && (
            <>
              <span aria-hidden="true">·</span>
              <Link href={`/hadith/${slug}/chapter/${chapter.n}#h-${hadith.number}`} className="hover:text-ink">
                {chapter.title}
              </Link>
            </>
          )}
        </div>
      </header>
      <HadithCard slug={slug} hadith={hadith} link={false} />
      <nav aria-label="الأحاديث" className="flex items-center justify-between gap-2 border-t border-border pt-5">
        {previous ? (
          <Link href={`/hadith/${slug}/${previous.number}`} className={link}>
            <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
            الحديث {previous.number}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/hadith/${slug}/${next.number}`} className={link}>
            الحديث {next.number}
            <IoChevronBack className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
