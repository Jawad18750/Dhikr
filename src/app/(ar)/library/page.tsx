import Link from 'next/link';

import { CardMark } from '@/components/site/logo-mark';
import { libraryIndex } from '@/lib/library';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/library',
  title: 'المكتبة | ذكر',
  description:
    'كتب في التجويد والرسم والغريب برواية قالون، والأذكار والعقيدة والفقه والسيرة: نصوص كاملة للقراءة والبحث، كما في تطبيقات ذكر.',
  omitLanguages: true,
});

const number = new Intl.NumberFormat('ar-u-nu-latn');

/** Every book the apps carry, by subject, each to its own page. */
export default function Page() {
  const { categories, books } = libraryIndex();

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
          والسيرة. نصوص كاملة تُقرأ هنا، وهي نفسها التي في تطبيقات ذكر.
        </p>
        <span className="text-[14px] text-on-hero/55">
          {number.format(books.length)} كتابًا · {number.format(books.reduce((sum, b) => sum + b.items, 0))} فقرة
        </span>
      </section>

      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`category-${category.id}`} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={`category-${category.id}`} className="font-display text-[24px] font-black text-ink sm:text-[30px]">
              {category.title}
            </h2>
            {category.subtitle && <p className="text-[15px] text-ink-subtle">{category.subtitle}</p>}
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {books
              .filter((book) => book.category === category.id)
              .map((book) => (
                <li key={book.id}>
                  <Link
                    href={`/library/${book.id}`}
                    className="group flex h-full flex-col gap-3 rounded-[22px] border border-border bg-surface p-2.5 transition-colors hover:border-border-strong"
                  >
                    <span className="relative block aspect-[3/4] overflow-hidden rounded-[16px] bg-surface-sunken">
                      {book.hasCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/library/cover/${book.id}`}
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
