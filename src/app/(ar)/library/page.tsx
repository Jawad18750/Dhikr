import Link from 'next/link';

import { CardMark } from '@/components/site/logo-mark';
import { ABOUT, collections } from '@/lib/hadith';
import { libraryIndex } from '@/lib/library';
import { PDF_BOOKS } from '@/lib/library-pdfs';
import { mawsuahIndex } from '@/lib/mawsuah';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { libraryIdOf, tafsirs } from '@/lib/tafsir';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/library',
  title: 'المكتبة | ذكر',
  description:
    'كتب في التجويد والرسم والغريب برواية قالون، والأذكار والعقيدة والفقه والسيرة: نصوص كاملة للقراءة والبحث، كما في تطبيقاتنا.',
  omitLanguages: true,
});

const number = new Intl.NumberFormat('ar-u-nu-latn');

/** Every book the apps carry, by subject, each to its own page. */
export default function Page() {
  const { categories: known, books } = libraryIndex();
  const mawsuah = mawsuahIndex();
  // The printed editions we have only as PDF; the mutun are a subject of their own.
  const categories = [
    ...known,
    { id: 'mutun', title: 'المتون والمنظومات', subtitle: 'متون ومنظومات في التجويد والرسم', order: 99 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:gap-10 sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[48px]">المكتبة</h1>
        <p className="max-w-[660px] text-[17px] leading-[1.85] text-on-hero/70">
          كتب في أحكام التجويد ورسم المصحف وغريب القرآن برواية قالون، ومعها كتب في الأذكار والعقيدة والفقه
          والسيرة. نصوص كاملة تُقرأ هنا، وهي نفسها التي في تطبيقاتنا.
        </p>
        <span className="text-[14px] text-on-hero/55">
          {number.format(books.length + PDF_BOOKS.length + collections().length)} كتابًا و{number.format(tafsirs().length)} تفاسير كاملة
        </span>
      </section>

      {mawsuah && (
        <Link
          href="/mawsuah"
          className="group flex flex-col gap-2 rounded-[24px] border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <span className="flex flex-col gap-1">
            <span className="font-display text-[22px] font-black text-ink sm:text-[26px]">{mawsuah.title_ar}</span>
            <span className="text-[15px] leading-[1.8] text-ink-muted">
              {number.format(mawsuah.sections.reduce((n, s) => n + s.topics.length, 0))} موضوعًا في{' '}
              {number.format(mawsuah.sections.length)} بابًا، من {mawsuah.publisher_ar}
            </span>
          </span>
          <span className="self-start rounded-full bg-ink px-4 py-2 text-[14px] font-bold text-background sm:self-center">
            تصفّح الموسوعة
          </span>
        </Link>
      )}

      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`category-${category.id}`} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`category-${category.id}`} className="font-display text-[24px] font-black text-ink sm:text-[30px]">
              {category.title}
            </h2>
            {category.subtitle && <p className="text-[15px] text-ink-subtle">{category.subtitle}</p>}
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              // The hadith collections, each to its chapters.
              ...(category.id === 'hadith'
                ? collections().map((h) => ({
                    id: h.slug,
                    href: `/hadith/${h.slug}`,
                    cover: h.slug === 'lulu_marjan' ? 'hadith_lulu_marjan' : null,
                    title: h.title,
                    author: ABOUT[h.slug]?.author || null,
                  }))
                : []),
              // The tafsirs head their subject; each opens on its surahs.
              ...(category.id === 'tafsir'
                ? tafsirs().map((t) => ({
                    id: t.id,
                    href: `/tafsir/${t.id}`,
                    cover: t.hasCover ? libraryIdOf(t.id) : null,
                    title: t.title,
                    author: t.author || null,
                  }))
                : []),
              ...books
                .filter((book) => book.category === category.id)
                .map((book) => ({
                  id: book.id,
                  href: `/library/${book.id}`,
                  cover: book.hasCover ? book.id : null,
                  title: book.title,
                  author: book.author,
                })),
              ...PDF_BOOKS.filter((book) => book.category === category.id).map((book) => ({
                id: book.id,
                href: `/library/${book.id}`,
                cover: null,
                title: book.title,
                author: book.author,
              })),
            ].map((book) => (
                <li key={book.id}>
                  <Link
                    href={book.href}
                    className="group flex h-full flex-col gap-3 rounded-[22px] border border-border bg-surface p-2.5 transition-colors hover:border-border-strong"
                  >
                    <span className="relative block aspect-[3/4] overflow-hidden rounded-[16px] bg-surface-sunken">
                      {book.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/library/cover/${book.cover}`}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center p-3 text-center font-display text-[18px] font-black text-ink-muted">
                          {book.title}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5 px-1 pb-1">
                      <span className="line-clamp-2 text-[15px] font-bold leading-[1.5] text-ink">{book.title}</span>
                      {book.author && <span className="line-clamp-1 text-[13px] text-ink-subtle">{book.author}</span>}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
