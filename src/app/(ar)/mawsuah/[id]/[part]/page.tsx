import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward, IoListOutline } from 'react-icons/io5';

import { Block, notesIn, Runs } from '@/components/site/mawsuah-text';
import { mawsuahArticle, mawsuahIndex, partsOf, topicOf } from '@/lib/mawsuah';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string; part: string }> };

function load(id: string, part: string) {
  const found = topicOf(Number(id));
  const article = found ? mawsuahArticle(found.topic.id) : null;
  if (!found || !article) return null;
  const parts = partsOf(article);
  const n = Number(part);
  if (!Number.isInteger(n) || n < 1 || n > parts.length) return null;
  return { ...found, article, parts, n, part: parts[n - 1] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, part } = await params;
  const at = load(id, part);
  if (!at) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/mawsuah/${id}/${part}`,
    title: `${at.part.title} · ${at.topic.title_ar} | موسوعة التفسير الموضوعي`,
    description: `${at.part.title}، من موضوع «${at.topic.title_ar}» في موسوعة التفسير الموضوعي.`,
    omitLanguages: true,
  });
}

/** One part of a topic: its text, its footnotes, the way on. */
export default async function Page({ params }: Props) {
  const { id, part } = await params;
  const at = load(id, part);
  if (!at) notFound();
  const { topic, article, parts, n } = at;
  const wanted = new Set(notesIn(at.part.blocks));
  const notes = article.notes.filter((note) => wanted.has(note.n));
  const link = 'flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong';

  const nav = (
    <nav aria-label="المباحث" className="flex items-center justify-between gap-2">
      {n > 1 ? (
        <Link href={`/mawsuah/${topic.id}/${n - 1}`} className={link}>
          <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          السابق
        </Link>
      ) : (
        <span />
      )}
      <Link
        href={`/mawsuah/${topic.id}`}
        aria-label="المباحث"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
      >
        <IoListOutline className="h-5 w-5" aria-hidden="true" />
      </Link>
      {n < parts.length ? (
        <Link
          href={`/mawsuah/${topic.id}/${n + 1}`}
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

  // The part's own heading becomes the page's title.
  const [first, ...rest] = at.part.blocks;
  const blocks = first?.k === 'h' && (first.l ?? 1) === 1 ? rest : at.part.blocks;

  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <Link href={`/mawsuah/${topic.id}`} className="text-[15px] font-bold text-ink-muted hover:text-ink">
          {mawsuahIndex()!.title_ar} · {topic.title_ar}
        </Link>
        <h1 className="font-display text-[28px] font-black leading-[1.4] text-ink sm:text-[34px]">{at.part.title}</h1>
        <span className="text-[13px] tabular-nums text-ink-subtle">
          {n} من {parts.length}
        </span>
      </header>

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>

      {notes.length > 0 && (
        <section aria-label="الحواشي" className="flex flex-col gap-2 border-t border-border pt-4">
          {notes.map((note) => (
            <p key={note.n} id={`note-${note.n}`} className="scroll-mt-24 text-[14px] leading-[1.9] text-ink-subtle">
              <span className="font-bold text-gold">{note.n}</span> <Runs runs={note.r} />
            </p>
          ))}
        </section>
      )}

      <div className="border-t border-border pt-5">{nav}</div>
    </article>
  );
}
