import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoBookOutline, IoChevronBack } from 'react-icons/io5';

import { CardMark } from '@/components/site/logo-mark';
import { mawsuahArticle, mawsuahIndex, partsOf, topicOf } from '@/lib/mawsuah';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = topicOf(Number(id));
  if (!found) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/mawsuah/${id}`,
    title: `${found.topic.title_ar} في القرآن الكريم | موسوعة التفسير الموضوعي`,
    description: `${found.topic.title_ar}: ${found.topic.headings.join('، ')}. من موسوعة التفسير الموضوعي.`,
    omitLanguages: true,
  });
}

/** One topic: where it sits, and its parts. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const found = topicOf(Number(id));
  const article = found ? mawsuahArticle(found.topic.id) : null;
  if (!found || !article) notFound();
  const parts = partsOf(article);
  const index = mawsuahIndex()!;

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-8"
      >
        <CardMark />
        <Link href={`/mawsuah#section-${found.section.id}`} className="text-[14px] text-on-hero/60 hover:text-on-hero">
          {index.title_ar} · {found.section.title_ar}
        </Link>
        <h1 className="font-display text-[32px] font-black leading-[1.3] sm:text-[44px]">{found.topic.title_ar}</h1>
        <p className="text-[14px] text-on-hero/55">{index.publisher_ar}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/mawsuah/${found.topic.id}/1`}
            className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
          >
            <IoBookOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            ابدأ القراءة
          </Link>
        </div>
      </section>

      <section aria-labelledby="contents" className="flex flex-col gap-4">
        <h2 id="contents" className="font-display text-[24px] font-black text-ink sm:text-[28px]">
          المباحث
        </h2>
        <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-surface">
          {parts.map((part, n) => (
            <li key={n}>
              <Link
                href={`/mawsuah/${found.topic.id}/${n + 1}`}
                className="flex items-center gap-3 px-4 py-3 text-[16px] text-ink transition-colors hover:bg-surface-sunken/60"
              >
                <span className="w-6 shrink-0 text-[13px] tabular-nums text-ink-subtle">{n + 1}</span>
                <span className="min-w-0 flex-1">{part.title}</span>
                <IoChevronBack className="h-4 w-4 shrink-0 text-ink-subtle ltr:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
