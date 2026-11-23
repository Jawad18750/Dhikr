import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

import { AyahInk } from '@/components/site/ayah-ink';
import { SURAHS } from '@/constants';
import { qalunSurah } from '@/lib/qalun-text';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { type Study, studyCredits, studyFor } from '@/lib/study';
import { tafsirs } from '@/lib/tafsir';
import { removeTashkeel } from '@/utils';

export const revalidate = 3600;

type Props = { params: Promise<{ surah: string; ayah: string }> };

const surahName = (n: number) => removeTashkeel(SURAHS.find((s) => s.id === n)?.name ?? '').replace(/^سورة\s+/, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surah, ayah } = await params;
  const a = qalunSurah(Number(surah)).find((x) => x.ayah === Number(ayah));
  if (!a) return {};
  return buildPageMetadata({
    locale: 'ar',
    path: `/ayah/${surah}/${ayah}`,
    title: `${surahName(Number(surah))} ${ayah}: المعاني والبلاغة والأحكام والتدبّر | ذكر`,
    description: a.text,
    omitLanguages: true,
  });
}

/** The sections, in reading order: what each holds and whose it is. */
const SECTIONS: { key: keyof Study; title: string; credit?: string }[] = [
  { key: 'meanings', title: 'معاني الكلمات', credit: 'credit_meanings' },
  { key: 'asbab', title: 'أسباب النزول', credit: 'credit_asbab' },
  { key: 'topics', title: 'الموضوعات' },
  { key: 'balagha', title: 'البلاغة' },
  { key: 'rulings', title: 'الأحكام', credit: 'credit_ahkam' },
  { key: 'similar', title: 'المتشابهات', credit: 'credit_mutashabihat' },
  { key: 'grammar', title: 'الإعراب' },
  { key: 'abrogation', title: 'الناسخ والمنسوخ', credit: 'credit_nasekh' },
  { key: 'reflections', title: 'وقفات تدبّرية' },
  { key: 'topicNotes', title: 'خواطر' },
  { key: 'fatwas', title: 'فتاوى', credit: 'credit_fatwas' },
  { key: 'questions', title: 'سؤال وجواب', credit: 'credit_qa' },
];

const card = 'flex flex-col gap-2 rounded-[18px] border border-border bg-surface p-4';
const body = 'whitespace-pre-line text-[17px] leading-[2] text-ink';
const by = 'text-[13px] text-ink-subtle';

/** Collapsible beyond the first few, so a long section does not bury the next. */
function Many<T>({ items, first = 4, render }: { items: T[]; first?: number; render: (item: T, index: number) => React.ReactNode }) {
  return (
    <>
      {items.slice(0, first).map((item, index) => render(item, index))}
      {items.length > first && (
        <details className="group flex flex-col gap-3">
          <summary className="cursor-pointer list-none self-start rounded-full border border-border px-4 py-2 text-[14px] font-bold text-ink hover:border-border-strong">
            المزيد ({items.length - first})
          </summary>
          <div className="flex flex-col gap-3 pt-3">{items.slice(first).map((item, index) => render(item, index + first))}</div>
        </details>
      )}
    </>
  );
}

function Section({ s, study }: { s: (typeof SECTIONS)[number]; study: Study }) {
  switch (s.key) {
    case 'meanings':
      return (
        <dl className="flex flex-col divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-surface">
          {study.meanings?.map((m, index) => (
            <div key={index} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
              <dt className="shrink-0 text-[17px] font-bold text-ink sm:w-[160px]">{m.word}</dt>
              <dd className="text-[16px] leading-[1.9] text-ink-muted">
                {m.meaning} <span className={by}>· {m.book}</span>
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'topics':
      return (
        <div className="flex flex-wrap gap-2">
          {study.topics?.map((t) => (
            <span key={t} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[14px] text-ink">
              {t}
            </span>
          ))}
        </div>
      );
    case 'fatwas':
      return (
        <Many
          items={study.fatwas ?? []}
          first={3}
          render={(f, index) => (
            <details key={index} className={card}>
              <summary className="cursor-pointer list-none text-[17px] font-bold text-ink">{f.title}</summary>
              <p className={`${body} pt-2 text-ink-muted`}>{f.question}</p>
              <p className={body}>{f.answer}</p>
              {f.mufti && <span className={by}>{f.mufti}</span>}
            </details>
          )}
        />
      );
    case 'questions':
      return (
        <Many
          items={study.questions ?? []}
          first={3}
          render={(q, index) => (
            <details key={index} className={card}>
              <summary className="cursor-pointer list-none text-[17px] font-bold text-ink">{q.question}</summary>
              <p className={`${body} pt-2`}>{q.answer}</p>
              {q.set && <span className={by}>{q.set}</span>}
            </details>
          )}
        />
      );
    default: {
      const items = (study[s.key] ?? []) as {
        text: string;
        source?: string | null;
        by?: string | null;
        book?: string | null;
        author?: string | null;
        ayahs?: string;
      }[];
      return (
        <Many
          items={items}
          render={(n, index) => (
            <article key={index} className={card}>
              <p className={body}>{n.text}</p>
              {(n.source || n.by || n.book || n.author || n.ayahs) && (
                <span className={by}>
                  {[n.book, n.author, n.by, n.source, n.ayahs && `المواضع: ${n.ayahs}`].filter(Boolean).join(' · ')}
                </span>
              )}
            </article>
          )}
        />
      );
    }
  }
}

/** One ayah: its words, what the scholars said of them, and the way to the tafsirs. */
export default async function Page({ params }: Props) {
  const { surah, ayah } = await params;
  const n = Number(surah);
  const ayahs = Number.isInteger(n) ? qalunSurah(n) : [];
  const a = ayahs.find((x) => x.ayah === Number(ayah));
  if (!a) notFound();
  const found = studyFor(n, a.ayah);
  const study = found?.study ?? {};
  const present = SECTIONS.filter((s) => (study[s.key]?.length ?? 0) > 0);
  const credits = studyCredits();
  const link = 'flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-[15px] font-bold text-ink hover:border-border-strong';

  return (
    <article className="mx-auto flex w-full max-w-[860px] flex-col gap-7 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Link href={`/surah/${n}`} className="font-display text-[26px] font-black text-ink hover:underline sm:text-[32px]">
            سورة {surahName(n)} · {a.ayah}
          </Link>
          {found && (found.hafs.length !== 1 || found.hafs[0] !== a.ayah) && (
            <span className="rounded-full border border-border px-3 py-1 text-[13px] text-ink-subtle">
              {found.hafs.length === 1 ? `الآية ${found.hafs[0]}` : `الآيات ${found.hafs.join('، ')}`} في ترقيم حفص
            </span>
          )}
        </div>
        <div className="rounded-[22px] bg-surface-sunken px-5 py-4 text-ink">
          <AyahInk surah={n} ayah={a.ayah} text={a.text} line={84} />
        </div>
        <div className="flex flex-wrap gap-2">
          {tafsirs().map((t) => (
            <Link
              key={t.id}
              href={`/tafsir/${t.id}/${n}/${a.ayah}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-[14px] text-ink-muted hover:border-border-strong hover:text-ink"
            >
              {t.title}
            </Link>
          ))}
        </div>
        {present.length > 0 && (
          <nav aria-label="أقسام الصفحة" className="flex flex-wrap gap-1.5 border-t border-border pt-4">
            {present.map((s) => (
              <a
                key={s.key}
                href={`#${s.key}`}
                className="rounded-full bg-surface-sunken px-3 py-1.5 text-[13.5px] font-bold text-ink hover:bg-border"
              >
                {s.title} <span className="font-normal text-ink-subtle">{study[s.key]?.length}</span>
              </a>
            ))}
          </nav>
        )}
      </header>

      {present.length === 0 && <p className="text-[16px] text-ink-muted">لا مواد لهذه الآية بعد.</p>}

      {present.map((s) => (
        <section key={s.key} id={s.key} className="flex scroll-mt-24 flex-col gap-3">
          <h2 className="font-display text-[22px] font-black text-ink sm:text-[26px]">{s.title}</h2>
          <Section s={s} study={study} />
          {s.credit && credits[s.credit] && <p className="text-[13px] leading-[1.8] text-ink-subtle">{credits[s.credit]}</p>}
        </section>
      ))}

      <nav aria-label="الآيات" className="flex items-center justify-between gap-2 border-t border-border pt-5">
        {a.ayah > 1 ? (
          <Link href={`/ayah/${n}/${a.ayah - 1}`} className={link}>
            <IoChevronForward className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
            الآية {a.ayah - 1}
          </Link>
        ) : (
          <span />
        )}
        {a.ayah < ayahs.length ? (
          <Link href={`/ayah/${n}/${a.ayah + 1}`} className={link}>
            الآية {a.ayah + 1}
            <IoChevronBack className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
      {credits.credit_ar && (
        <p className="text-[13px] leading-[1.8] text-ink-subtle">
          {credits.credit_ar}{' '}
          <a href="https://quranpedia.net" target="_blank" rel="noopener noreferrer" className="underline">
            quranpedia.net
          </a>
        </p>
      )}
    </article>
  );
}
