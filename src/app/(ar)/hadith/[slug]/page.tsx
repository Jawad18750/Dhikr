import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';

import { HadithCard } from '@/components/site/hadith-card';
import { CardMark } from '@/components/site/logo-mark';
import { ABOUT, collection } from '@/lib/hadith';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = collection(slug);
  if (!c) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/hadith/${slug}`,
    title: `${c.title} | ذكر`,
    description: `${c.title}${ABOUT[slug]?.author ? `، ${ABOUT[slug].author}` : ''}: ${c.count} حديثًا في ${c.chapters.length} بابًا، النص كاملًا.`,
    omitLanguages: true,
  });
}

const number = new Intl.NumberFormat('ar-u-nu-latn');

/** A collection: what it is, and its chapters. */
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = collection(slug);
  if (!c) notFound();
  const about = ABOUT[slug];

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-8"
      >
        <CardMark />
        <Link href="/hadith" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          كتب الحديث
        </Link>
        <h1 className="font-display text-[32px] font-black leading-[1.3] sm:text-[44px]">{c.title}</h1>
        {about?.author && <p className="text-[17px] text-on-hero/75">{about.author}</p>}
        <p className="text-[14px] leading-[1.8] text-on-hero/55">
          {number.format(c.count)} حديثًا{c.chapters.length > 1 && ` · ${number.format(c.chapters.length)} بابًا`}
          {c.source && (
            <>
              {' · '}
              <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="underline">
                {c.source.name}
              </a>
            </>
          )}
        </p>
      </section>

      {c.chapters.length === 1 ? (
        // One chapter (the forties): the hadiths themselves.
        <div className="flex flex-col gap-4">
          {c.hadiths.map((h) => (
            <HadithCard key={h.number} slug={slug} hadith={h} />
          ))}
        </div>
      ) : (
      <section aria-labelledby="contents" className="flex flex-col gap-4">
        <h2 id="contents" className="font-display text-[24px] font-black text-ink sm:text-[28px]">
          الأبواب
        </h2>
        <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-surface">
          {c.chapters.map((chapter) => (
            <li key={chapter.n}>
              <Link
                href={`/hadith/${slug}/chapter/${chapter.n}`}
                className="flex items-center gap-3 px-4 py-3 text-[16px] text-ink transition-colors hover:bg-surface-sunken/60"
              >
                <span className="min-w-0 flex-1">{chapter.title}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-ink-subtle">
                  {chapter.count === 1 ? number.format(chapter.from) : `${number.format(chapter.from)}–${number.format(chapter.to)}`}
                </span>
                <IoChevronBack className="h-4 w-4 shrink-0 text-ink-subtle ltr:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
      )}
    </div>
  );
}
