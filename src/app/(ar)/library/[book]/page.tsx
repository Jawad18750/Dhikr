import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoBookOutline, IoChevronBack, IoCloudDownloadOutline, IoDocumentOutline } from 'react-icons/io5';

import { CardMark } from '@/components/site/logo-mark';
import { libraryIndex, loadBook, sectionsOf } from '@/lib/library';
import { PDF_BOOKS, PDF_OF, pdfSize,type PdfSource } from '@/lib/library-pdfs';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ book: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book: id } = await params;
  const book = libraryIndex().books.find((b) => b.id === id) ?? PDF_BOOKS.find((b) => b.id === id);
  if (!book) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/library/${id}`,
    title: `${book.title} | ذكر`,
    description: `${book.title}${book.author ? `، ${book.author}` : ''}: النص كاملًا للقراءة في مكتبة ذكر.`,
    omitLanguages: true,
  });
}

const number = new Intl.NumberFormat('ar-u-nu-latn');
const megabytes = (bytes: number) => `${number.format(Math.round((bytes / 1_048_576) * 10) / 10)} م.ب`;

/** Read the printed edition in the browser, or save it. */
function PdfButtons({ pdf }: { pdf: PdfSource }) {
  const size = pdfSize(pdf.file);
  if (size === null) return null;
  const base = `/api/library/pdf/${pdf.file}`;
  const pill = 'flex h-11 items-center gap-2 rounded-full bg-on-hero/[0.08] px-5 text-[15px] font-bold text-on-hero hover:bg-on-hero/15';
  return (
    <>
      <a href={base} target="_blank" rel="noopener" className={pill}>
        <IoDocumentOutline className="h-[18px] w-[18px]" aria-hidden="true" />
        النسخة المطبوعة (PDF)
      </a>
      <a href={`${base}?download=1`} className={pill}>
        <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
        تنزيل · {megabytes(size)}
      </a>
    </>
  );
}

/** A book we have only as its printed PDF. */
function PdfBook({ id }: { id: string }) {
  const book = PDF_BOOKS.find((b) => b.id === id);
  if (!book) notFound();
  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-8"
      >
        <CardMark />
        <Link href="/library" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          المكتبة
        </Link>
        <h1 className="font-display text-[28px] font-black leading-[1.3] sm:text-[40px]">{book.title}</h1>
        <p className="text-[17px] text-on-hero/75">{book.author}</p>
        <p className="text-[14px] text-on-hero/55">
          النسخة المطبوعة
          {book.pdf.url ? (
            <>
              {' '}
              من{' '}
              <a href={book.pdf.url} target="_blank" rel="noopener noreferrer" className="underline">
                {book.pdf.from}
              </a>
            </>
          ) : null}
          . نصّه المكتوب قيد الإعداد.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <PdfButtons pdf={book.pdf} />
        </div>
      </section>
    </div>
  );
}

/** One book: what it is, where its text comes from, and its contents. */
export default async function Page({ params }: Props) {
  const { book: id } = await params;
  const book = loadBook(id);
  if (!book) return <PdfBook id={id} />;
  const pdf = PDF_OF[book.id];
  const category = libraryIndex().categories.find((c) => c.id === book.category);
  const sections = sectionsOf(book);
  // The contents: each heading where the book has them, else each titled section.
  const entries = sections.flatMap((s, index) => {
    const titles = s.headings.length > 0 ? s.headings : /^صفحة \d+$/.test(s.section.title) ? [] : [s.title];
    return titles.map((title, n) => ({ key: `${index}-${n}`, title, at: index + 1, chapter: s.chapter }));
  });
  const chapters = book.chapters.length > 1;

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[28px] bg-hero p-5 text-on-hero sm:flex-row sm:items-center sm:rounded-[36px] sm:p-8"
      >
        <CardMark />
        {book.hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/library/cover/${book.id}`}
            alt=""
            className="aspect-[3/4] w-[130px] shrink-0 rounded-[18px] object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] sm:w-[170px]"
          />
        )}
        <div className="flex min-w-0 flex-col gap-3">
          <Link href="/library" className="text-[14px] text-on-hero/60 hover:text-on-hero">
            المكتبة{category ? ` · ${category.title}` : ''}
          </Link>
          <h1 className="font-display text-[28px] font-black leading-[1.3] sm:text-[40px]">{book.title}</h1>
          {book.author && <p className="text-[17px] text-on-hero/75">{book.author}</p>}
          <p className="text-[14px] leading-[1.8] text-on-hero/55">
            {number.format(sections.length)} قسمًا · {number.format(book.items)} فقرة
            {book.source.name && (
              <>
                {' · '}
                {book.source.url ? (
                  <a href={book.source.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {book.source.name}
                  </a>
                ) : (
                  book.source.name
                )}
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`/library/${book.id}/1`}
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
            >
              <IoBookOutline className="h-[18px] w-[18px]" aria-hidden="true" />
              ابدأ القراءة
            </Link>
            {pdf && <PdfButtons pdf={pdf} />}
          </div>
        </div>
      </section>

      <section aria-labelledby="contents" className="flex flex-col gap-4">
        <h2 id="contents" className="font-display text-[24px] font-black text-ink sm:text-[28px]">
          المحتويات
        </h2>
        <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-surface">
          {entries.map((entry, index) => (
            <li key={entry.key}>
              {chapters && (index === 0 || entries[index - 1].chapter.id !== entry.chapter.id) && (
                <div className="bg-surface-sunken px-4 py-2.5 text-[14px] font-bold text-ink-muted">
                  {entry.chapter.title}
                </div>
              )}
              <Link
                href={`/library/${book.id}/${entry.at}`}
                className="flex items-center gap-3 px-4 py-3 text-[16px] text-ink transition-colors hover:bg-surface-sunken/60"
              >
                <span className="min-w-0 flex-1">{entry.title}</span>
                <IoChevronBack className="h-4 w-4 shrink-0 text-ink-subtle ltr:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
