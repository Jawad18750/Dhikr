import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardMark } from '@/components/site/logo-mark';
import { mawsuahIndex } from '@/lib/mawsuah';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/mawsuah',
  title: 'موسوعة التفسير الموضوعي | ذكر',
  description:
    'موسوعة التفسير الموضوعي من مركز تفسير للدراسات القرآنية: موضوعات القرآن في ثمانية عشر بابًا، لكل موضوع مفهومه واستعماله القرآني ومباحثه، مع آياته بخط مصحف الجماهيرية.',
  omitLanguages: true,
});

const number = new Intl.NumberFormat('ar-u-nu-latn');
const parts = (n: number) =>
  n === 1 ? 'مبحث واحد' : n === 2 ? 'مبحثان' : `${number.format(n)} ${n % 100 >= 3 && n % 100 <= 10 ? 'مباحث' : 'مبحثًا'}`;

/** The encyclopedia's sections, each with its topics. */
export default function Page() {
  const index = mawsuahIndex();
  if (!index) notFound();
  const topics = index.sections.reduce((n, s) => n + s.topics.length, 0);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:gap-10 sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <Link href="/library" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          المكتبة
        </Link>
        <h1 className="font-display text-[30px] font-black leading-[1.3] sm:text-[44px]">{index.title_ar}</h1>
        <p className="max-w-[680px] text-[17px] leading-[1.85] text-on-hero/70">
          موضوعات القرآن الكريم كما عرضها {index.publisher_ar}: لكل موضوع مفهومه، واستعماله في القرآن، والألفاظ ذات
          الصلة، ثم مباحثه. وكل آية يُستشهد بها تُفتح بخط مصحف الجماهيرية.
        </p>
        <span className="text-[14px] text-on-hero/55">
          {number.format(index.sections.length)} بابًا · {number.format(topics)} موضوعًا · {index.license_ar}
        </span>
      </section>

      <nav aria-label="الأبواب" className="flex flex-wrap gap-2">
        {index.sections.map((s) => (
          <a
            key={s.id}
            href={`#section-${s.id}`}
            className="rounded-full bg-surface-sunken px-3.5 py-1.5 text-[14px] font-bold text-ink hover:bg-border"
          >
            {s.title_ar} <span className="font-normal text-ink-subtle">{number.format(s.topics.length)}</span>
          </a>
        ))}
      </nav>

      {index.sections.map((s) => (
        <section key={s.id} id={`section-${s.id}`} aria-labelledby={`title-${s.id}`} className="flex scroll-mt-24 flex-col gap-4">
          <h2 id={`title-${s.id}`} className="font-display text-[24px] font-black text-ink sm:text-[28px]">
            {s.title_ar}
          </h2>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {s.topics.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/mawsuah/${t.id}`}
                  className="flex h-full flex-col gap-1 rounded-[18px] border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong"
                >
                  <span className="text-[16px] font-bold leading-[1.5] text-ink">{t.title_ar}</span>
                  <span className="text-[13px] text-ink-subtle">{parts(t.headings.length)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
