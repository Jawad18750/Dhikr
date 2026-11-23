import Link from 'next/link';
import { IoChevronBack } from 'react-icons/io5';

import { CardMark } from '@/components/site/logo-mark';
import { SurahName } from '@/components/site/surah-name';
import { SURAHS } from '@/constants';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';
import { getSurahFacts } from '@/lib/dhikr-surah-facts';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { removeTashkeel } from '@/utils';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/surahs',
  title: 'سور القرآن الكريم برواية قالون | ذكر',
  description: 'السور المئة والأربع عشرة بخط مصحف الجماهيرية، ولكل سورة صفحة بكل قرّائها.',
  omitLanguages: true,
});

/** The 114 surahs, each to its page with every reciter who has it. */
export default async function Page() {
  // Ayahs in this numbering (Qalun), as the most listened recitation counts them.
  const top = (await getDhikrCatalogue())[0];
  const facts = top ? await getSurahFacts(top.slug) : {};

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-4 pb-12 pt-6 text-foreground sm:gap-8 sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[48px]">السور</h1>
        <p className="max-w-[620px] text-[17px] leading-[1.85] text-on-hero/70">
          السور المئة والأربع عشرة بخط مصحف الجماهيرية. لكل سورة صفحة فيها كل قرّائها، والاستماع إليها
          مع المصحف كلمةً كلمة.
        </p>
      </section>
      <ol className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {SURAHS.map((surah) => {
          const name = removeTashkeel(surah.name);
          return (
            <li key={surah.id}>
              <Link
                href={`/surah/${surah.id}`}
                className="group flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-3 transition-colors hover:border-border-strong sm:p-3.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-[15px] font-bold tabular-nums text-ink-muted group-hover:border-border-strong">
                  {surah.id}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <SurahName
                    surah={surah.id}
                    name={`سورة ${name}`}
                    size={38}
                    className="text-[18px] font-bold leading-[38px] text-ink"
                  />
                  <span className="truncate text-[13px] text-ink-subtle">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    {facts[surah.id]?.ayahs ? ` · ${facts[surah.id].ayahs} آية` : ''}
                  </span>
                </span>
                <IoChevronBack className="h-5 w-5 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
