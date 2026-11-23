import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward, IoListOutline } from 'react-icons/io5';

import { type Block, loadBook, sectionAt } from '@/lib/library';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ book: string; section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: id, section } = await params;
  const book = loadBook(id);
  const at = book ? sectionAt(book, Number(section)) : null;
  if (!book || !at) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/library/${id}/${section}`,
    title: `${at.title} · ${book.title} | ذكر`,
    description: at.section.blocks.find((b) => b.type === 'paragraph')?.text.slice(0, 160) ?? book.title,
    omitLanguages: true,
  });
}

function Text({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="pt-4 font-display text-[22px] font-black leading-[1.5] text-ink sm:text-[26px]">
          {block.text}
        </h2>
      );
    case 'quote':
      return (
        <blockquote className="rounded-[18px] border-s-4 border-gold/60 bg-gold/[0.06] px-5 py-3.5 text-[19px] leading-[2.1] text-ink">
          {block.text}
        </blockquote>
      );
    case 'footnote':
      return <p className="border-t border-border pt-2 text-[14px] leading-[1.9] text-ink-subtle">{block.text}</p>;
    default:
      return <p className="whitespace-pre-line text-[18px] leading-[2.1] text-ink">{block.text}</p>;
  }
}

/** One section of a book, as the book prints it, with where it falls in the book. */
export default async function Page({ params }: Props) {
  const { book: id, section } = await params;
  const book = loadBook(id);
  const n = Number(section);
  const at = book && Number.isInteger(n) ? sectionAt(book, n) : null;
  if (!book || !at) notFound();
  let lastPage: number | undefined;

  const nav = (
    <nav aria-label="التنقل في الكتاب" className="flex items-center justify-between gap-2">
      {n > 1 ? (
        <Link
          href={`/library/${book.id}/${n - 1}`}
          className="flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong"
        >
          <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          السابق
        </Link>
      ) : (
        <span />
      )}
      <Link
        href={`/library/${book.id}`}
        aria-label="المحتويات"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
      >
        <IoListOutline className="h-5 w-5" aria-hidden="true" />
      </Link>
      {n < at.total ? (
        <Link
          href={`/library/${book.id}/${n + 1}`}
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
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <Link href={`/library/${book.id}`} className="text-[15px] font-bold text-ink-muted hover:text-ink">
          {book.title}
        </Link>
        {book.chapters.length > 1 && <span className="text-[14px] text-ink-subtle">{at.chapter.title}</span>}
        <h1 className="font-display text-[28px] font-black leading-[1.4] text-ink sm:text-[34px]">{at.title}</h1>
        <span className="text-[13px] tabular-nums text-ink-subtle">
          {n} / {at.total}
        </span>
      </header>
      <div className="flex flex-col gap-4">
        {at.section.blocks.map((block) => {
          const marker = block.page && block.page !== lastPage;
          if (block.page) lastPage = block.page;
          return (
            <div key={block.id} className="flex flex-col gap-4">
              {marker && (
                <span
                  aria-label={`صفحة ${block.page}`}
                  className="self-center rounded-full border border-border px-3 py-0.5 text-[12px] tabular-nums text-ink-subtle"
                >
                  ص {block.page}
                </span>
              )}
              <Text block={block} />
            </div>
          );
        })}
      </div>
      <div className="border-t border-border pt-5">{nav}</div>
    </article>
  );
}
