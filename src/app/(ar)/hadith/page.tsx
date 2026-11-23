import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardMark } from '@/components/site/logo-mark';
import { ABOUT, collections } from '@/lib/hadith';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/hadith',
  title: 'كتب الحديث | ذكر',
  description:
    'اللؤلؤ والمرجان، ورياض الصالحين، وبلوغ المرام، والأدب المفرد، والشمائل المحمدية، والأربعون النووية والقدسية: نصوصها كاملة، مبوّبة، كما في تطبيقات ذكر.',
  omitLanguages: true,
});

const number = new Intl.NumberFormat('ar-u-nu-latn');

/** The collections, each to its chapters. */
export default function Page() {
  const list = collections();
  if (list.length === 0) notFound();
  const total = list.reduce((n, c) => n + c.count, 0);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <Link href="/library" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          المكتبة
        </Link>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[48px]">كتب الحديث</h1>
        <p className="max-w-[660px] text-[17px] leading-[1.85] text-on-hero/70">
          كتب الحديث التي في تطبيقات ذكر، بنصوصها كاملة ومبوّبة كما رتّبها أصحابها، لكل حديث صفحته ورقمه.
        </p>
        <span className="text-[14px] text-on-hero/55">
          {number.format(list.length)} كتب · {number.format(total)} حديثًا
        </span>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/hadith/${c.slug}`}
              className="flex h-full flex-col gap-1.5 rounded-[22px] border border-border bg-surface p-5 transition-colors hover:border-border-strong"
            >
              <span className="font-display text-[22px] font-black text-ink">{c.title}</span>
              {ABOUT[c.slug]?.author && <span className="text-[14px] text-ink-muted">{ABOUT[c.slug].author}</span>}
              {ABOUT[c.slug] && <span className="text-[15px] leading-[1.8] text-ink-muted">{ABOUT[c.slug].about}</span>}
              <span className="pt-1 text-[13px] text-ink-subtle">{number.format(c.count)} حديثًا</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
