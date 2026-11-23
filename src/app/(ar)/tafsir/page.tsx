import Link from 'next/link';

import { CardMark } from '@/components/site/logo-mark';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { libraryIdOf, tafsirs } from '@/lib/tafsir';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/tafsir',
  title: 'التفاسير | ذكر',
  description: 'تسعة تفاسير كاملة على آيات مصحف الجماهيرية برواية قالون: السعدي، والمختصر، والميسر، وابن كثير، والبغوي، والقرطبي، والجلالين، وفتح القدير، والمحرر الوجيز.',
  omitLanguages: true,
});

/** The nine tafsirs, each to its surahs. */
export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <Link href="/library" className="text-[14px] text-on-hero/60 hover:text-on-hero">
          المكتبة
        </Link>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[48px]">التفاسير</h1>
        <p className="max-w-[660px] text-[17px] leading-[1.85] text-on-hero/70">
          تسعة تفاسير كاملة، كل آية من آيات مصحف الجماهيرية برواية قالون بتفسيرها. التفاسير مرقّمة بحفص في
          أصولها، فنقابل بين الترقيمين آيةً آية.
        </p>
      </section>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tafsirs().map((t) => (
          <li key={t.id}>
            <Link
              href={`/tafsir/${t.id}`}
              className="group flex h-full flex-col gap-3 rounded-[22px] border border-border bg-surface p-2.5 transition-colors hover:border-border-strong"
            >
              <span className="block aspect-[3/4] overflow-hidden rounded-[16px] bg-surface-sunken">
                {t.hasCover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/library/cover/${libraryIdOf(t.id)}`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </span>
              <span className="flex flex-col gap-0.5 px-1 pb-1">
                <span className="text-[15px] font-bold leading-[1.5] text-ink">{t.title}</span>
                <span className="line-clamp-1 text-[13px] text-ink-subtle">{t.author}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
